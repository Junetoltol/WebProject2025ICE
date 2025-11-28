package com.jobbuddy.backend.service;
// 만든놈 최은준

import com.jobbuddy.backend.ai.AiCoverLetterClient;
import com.jobbuddy.backend.ai.AiCoverLetterClient.AiCoverLetterRequest;
import com.jobbuddy.backend.ai.AiCoverLetterClient.AiCoverLetterResponse;
import com.jobbuddy.backend.ai.AiCoverLetterClient.EssayConfig;
import com.jobbuddy.backend.ai.AiCoverLetterClient.ResumeData;
import com.jobbuddy.backend.dto.CoverLetterListItemResponse;
import com.jobbuddy.backend.dto.CoverLetterPreviewResponse;
import com.jobbuddy.backend.dto.CoverLetterReqDto;
import com.jobbuddy.backend.dto.PageResponse;
import com.jobbuddy.backend.model.CoverLetter;
import com.jobbuddy.backend.model.CoverLetterStatus;
import com.jobbuddy.backend.model.User;
import com.jobbuddy.backend.repository.CoverLetterRepository;
import com.jobbuddy.backend.repository.UserRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CoverLetterServiceImpl implements CoverLetterService {

    private final CoverLetterRepository coverLetterRepository;
    private final UserRepository userRepository;
    private final AiCoverLetterClient aiCoverLetterClient;

    public CoverLetterServiceImpl(CoverLetterRepository coverLetterRepository,
                                  UserRepository userRepository,
                                  AiCoverLetterClient aiCoverLetterClient) {
        this.coverLetterRepository = coverLetterRepository;
        this.userRepository = userRepository;
        this.aiCoverLetterClient = aiCoverLetterClient;
    }

    // =================================================================================
    // (1), (3), (5) 미리보기 조회 (인자 11개 맞춤)
    // =================================================================================
    @Override
    @Transactional(readOnly = true)
    public CoverLetterPreviewResponse getCoverLetterPreview(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));


        // 생성자 순서: id, title, questions, tone, length, status, previewUrl, sections, ownerName, createdAt, updatedAt
        return new CoverLetterPreviewResponse(
                coverLetter.getId(),
                coverLetter.getTitle(),
                coverLetter.getQuestions(),
                coverLetter.getTone(),
                coverLetter.getLengthPerQuestion(),
                coverLetter.getStatus() != null ? coverLetter.getStatus().name() : "PROCESSING",
                coverLetter.getPreviewUrl(),
                coverLetter.getSections(), // Map<String, Object>
                coverLetter.getCreatedAt(),
                coverLetter.getUpdatedAt()
        );
    }

    // ===================== 파일 다운로드 & 보관함 저장 =====================

    @Override
    public Resource downloadCoverLetter(Long coverLetterId, String format, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));

        if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
            throw new IllegalStateException("Cover letter is not generated yet.");
        }

        String normalized = format == null ? "" : format.toLowerCase();
        if (!normalized.equals("word") && !normalized.equals("pdf")) {
            throw new IllegalArgumentException("Unsupported format.");
        }

        String dummy = "Cover letter " + coverLetter.getId() + " (" + normalized + ")";
        byte[] bytes = dummy.getBytes(StandardCharsets.UTF_8);

        return new ByteArrayResource(bytes);
    }

    @Override
    @Transactional
    public void archiveCoverLetter(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));

        if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
            throw new IllegalStateException("Cover letter is not generated yet.");
        }

        coverLetter.setArchived(true);
        coverLetterRepository.save(coverLetter);
    }

    @Override
    public PageResponse<CoverLetterListItemResponse> getArchivedCoverLetters(
            Long userId,
            String q,
            String tone,
            String sort,
            int page,
            int size
    ) {
        Sort sortObj;
        if (sort == null || sort.isBlank()) {
            sortObj = Sort.by(Sort.Direction.DESC, "updatedAt");
        } else {
            String[] parts = sort.split(",");
            String property = parts[0];
            Sort.Direction direction =
                    (parts.length > 1 && parts[1].equalsIgnoreCase("asc"))
                            ? Sort.Direction.ASC
                            : Sort.Direction.DESC;
            sortObj = Sort.by(direction, property);
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<CoverLetter> pageResult =
                coverLetterRepository.findByOwnerIdAndArchivedTrue(userId, pageable);

        var content = pageResult.getContent().stream()
                .map(c -> new CoverLetterListItemResponse(
                        c.getId(),
                        c.getTitle(),
                        c.getPreviewUrl(),
                        c.getUpdatedAt()
                ))
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages()
        );
    }

    // =================================================================================
    // (1) 임시 저장
    // =================================================================================
    @Override
    @Transactional
    public Long saveOrUpdateCoverLetter(Long userId,
                                        Long coverLetterId,
                                        CoverLetterReqDto.SaveRequest request) {

        if (coverLetterId == null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            CoverLetter coverLetter = new CoverLetter();
            coverLetter.setOwner(user);
            coverLetter.updateContent(
                    request.getTitle(),
                    request.getTargetCompany(),
                    request.getTargetJob(),
                    request.getSections()
            );
            coverLetter.setStatus(CoverLetterStatus.PROCESSING);
            return coverLetterRepository.save(coverLetter).getId();
        } else {
            // 수정 (PATCH)
            CoverLetter coverLetter =
                    coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                            .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

            coverLetter.updateContent(
                    request.getTitle(),
                    request.getTargetCompany(),
                    request.getTargetJob(),
                    request.getSections()
            );
            return coverLetter.getId();
        }
    }

    // ===================== 템플릿 선택 =====================

    @Override
    @Transactional
    public void updateTemplate(Long userId, Long resumeId, String templateId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.updateTemplate(templateId);
    }

    // ===================== 구성 설정 저장 =====================

    @Override
    @Transactional
    public void updateSettings(Long userId,
                               Long coverLetterId,
                               List<String> questions,
                               String tone,
                               Integer lengthPerQuestion) {

        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.setQuestions(questions);
        coverLetter.setTone(tone);
        coverLetter.setLengthPerQuestion(lengthPerQuestion);
    }

    // ===================== 생성 요청 (AI 연동) =====================
@Override
@Transactional
public void generateCoverLetter(Long userId, Long coverLetterId) {
    // 1) 자소서 + 유저 검증
    CoverLetter coverLetter = coverLetterRepository
            .findByIdAndOwnerId(coverLetterId, userId)
            .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("User not found"));

    // 2) 상태를 PROCESSING 으로 변경
    coverLetter.setStatus(CoverLetterStatus.PROCESSING);
    coverLetterRepository.save(coverLetter);

    // 3) AI 요청 DTO 구성
    AiCoverLetterRequest req = new AiCoverLetterRequest();
    Map<String, Object> sections = coverLetter.getSections();
    ResumeData data = new ResumeData();

    if (sections != null) {
        // 🔹 profile (있으면 사용, 지금은 프론트에서 안보내지만 대비)
        Object profileObj = sections.get("profile");
        if (profileObj instanceof Map<?, ?>) {
            @SuppressWarnings("unchecked")
            Map<String, Object> profileMap = (Map<String, Object>) profileObj;
            data.setProfile(profileMap);
        }

        // 🔹 experiences ← experiences | experience | educationExperience
        Object expObj = sections.get("experiences");
        if (expObj == null) expObj = sections.get("experience");
        if (expObj == null) expObj = sections.get("educationExperience");

        if (expObj instanceof List<?>) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> expList = (List<Map<String, Object>>) expObj;
            data.setExperiences(expList);
        }

        // 🔹 projects ← projects | projectExperience
        Object projObj = sections.get("projects");
        if (projObj == null) projObj = sections.get("projectExperience");

        if (projObj instanceof List<?>) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> projList = (List<Map<String, Object>>) projObj;
            data.setProjects(projList);
        }

        // 🔹 activities ← activities | club | clubs
        Object actObj = sections.get("activities");
        if (actObj == null) actObj = sections.get("club");
        if (actObj == null) actObj = sections.get("clubs");

        if (actObj instanceof List<?>) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> actList = (List<Map<String, Object>>) actObj;
            data.setActivities(actList);
        }

        // 🔹 awards ← awards
        Object awardsObj = sections.get("awards");
        if (awardsObj instanceof List<?>) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> awardsList = (List<Map<String, Object>>) awardsObj;
            data.setAwards(awardsList);
        }
    }

        // 🔹 skills ← skills | technicalSkills
        Object skillsObj = sections.get("skills");
        if (skillsObj == null) skillsObj = sections.get("technicalSkills");

        if (skillsObj instanceof List<?>) {
            List<?> rawList = (List<?>) skillsObj;

            if (rawList.isEmpty() || rawList.get(0) instanceof String) {
                // List<String>
                @SuppressWarnings("unchecked")
                List<String> skillNames = (List<String>) skillsObj;
                data.setSkills(skillNames);
            } else if (rawList.get(0) instanceof Map) {
                // List<Map<String,Object>> 인 경우 → name 필드를 문자열로 뽑기 (나중 확장용)
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> skillMapList = (List<Map<String, Object>>) skillsObj;
                List<String> names = skillMapList.stream()
                        .map(m -> String.valueOf(m.getOrDefault("name", "")))
                        .toList();
                data.setSkills(names);
            }
        }
    }

    req.setData(data);

    // 에세이 설정 (기존 로직 유지)
    EssayConfig essay = new EssayConfig();
    essay.setQuestion("지원 동기");
    essay.setTone(coverLetter.getTone() != null ? coverLetter.getTone() : "진솔한");
    essay.setLength(
            coverLetter.getLengthPerQuestion() != null
                    ? coverLetter.getLengthPerQuestion()
                    : 1000
    );
    req.setEssay(essay);

    // 4) AI 서버 호출
    AiCoverLetterResponse res = aiCoverLetterClient.generate(req);
    String generatedText = (res != null) ? res.getCoverLetter() : null;

    System.out.println("=== [SERVICE] generatedText = " + generatedText);

    if (generatedText == null || generatedText.isBlank()) {
        coverLetter.setStatus(CoverLetterStatus.FAILED);
        coverLetterRepository.save(coverLetter);
        throw new IllegalStateException("AI가 자소서를 생성하지 못했습니다.");
    }

    // 5) 결과 저장
    Map<String, Object> updatedSections = coverLetter.getSections();
    if (updatedSections == null) {
        updatedSections = new HashMap<>();
    }
    updatedSections.put("generatedCoverLetter", generatedText);
    coverLetter.setSections(updatedSections);

    coverLetter.setStatus(CoverLetterStatus.SUCCESS);
    coverLetterRepository.save(coverLetter);
}

        String fileContent = "제목: " + coverLetter.getTitle() + "\n\n" + content;
        byte[] bytes = fileContent.getBytes(StandardCharsets.UTF_8);

        return new ByteArrayResource(bytes);
    }

    // =================================================================================
    // (5) 보관함 삭제
    // =================================================================================
    @Override
    @Transactional
    public void deleteCoverLetter(Long userId, Long resumeId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetterRepository.delete(coverLetter);
    }

    // =================================================================================
    // (5) 제목 수정
    // =================================================================================
    @Override
    @Transactional
    public void updateTitle(Long userId, Long resumeId, String newTitle) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.updateTitle(newTitle);
    }

    // =================================================================================
    // (5) 보관함 목록 조회 (인자 5개 맞춤 & 제네릭 명시)
    // =================================================================================
    @Override
    public PageResponse<CoverLetterListItemResponse> getArchivedCoverLetters(Long userId, String q, String tone, String sort, int page, int size) {
        Sort sortObj;
        if (sort == null || sort.isBlank()) {
            sortObj = Sort.by(Sort.Direction.DESC, "updatedAt");
        } else {
            String[] parts = sort.split(",");
            String property = parts[0];
            Sort.Direction direction = (parts.length > 1 && parts[1].equalsIgnoreCase("asc")) ? Sort.Direction.ASC : Sort.Direction.DESC;
            sortObj = Sort.by(direction, property);
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<CoverLetter> pageResult = coverLetterRepository.findByOwnerIdAndArchivedTrue(userId, pageable);

        // 생성자 순서: id, title, previewUrl, status, updatedAt
        List<CoverLetterListItemResponse> content = pageResult.getContent().stream()
                .map(c -> new CoverLetterListItemResponse(
                        c.getId(),
                        c.getTitle(),
                        c.getPreviewUrl(),
                        c.getStatus() != null ? c.getStatus().name() : "PROCESSING",
                        c.getUpdatedAt()
                ))
                .collect(Collectors.toList());

        // [수정됨] 제네릭 타입 명시 (<CoverLetterListItemResponse>)
        return new PageResponse<CoverLetterListItemResponse>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages()
        );
    }

    // 기타 유지 메서드들
    @Override
    @Transactional
    public void updateTemplate(Long userId, Long resumeId, String templateId) {
        CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(resumeId, userId).orElseThrow();
        coverLetter.updateTemplate(templateId);
    }

    @Override
    @Transactional
    public void updateGeneratedContent(Long userId, Long coverLetterId, String content) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        // sections JSON 안의 "generatedCoverLetter"만 교체
        Map<String, Object> sections = coverLetter.getSections();
        if (sections == null) sections = new HashMap<>();
        sections.put("generatedCoverLetter", content);
        coverLetter.setSections(sections);
        coverLetterRepository.save(coverLetter);
    }

    @Override
    @Transactional
    public void archiveCoverLetter(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId).orElseThrow();
        coverLetter.setArchived(true);
    }
}