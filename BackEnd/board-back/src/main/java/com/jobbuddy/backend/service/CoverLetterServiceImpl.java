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

    // ===================== 미리보기 =====================

    @Override
    public CoverLetterPreviewResponse getCoverLetterPreview(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));

        if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
            throw new IllegalStateException("Cover letter is not generated yet.");
        }

        return new CoverLetterPreviewResponse(
                coverLetter.getId(),
                coverLetter.getTitle(),
                coverLetter.getQuestions(),
                coverLetter.getTone(),
                coverLetter.getLengthPerQuestion(),
                coverLetter.getStatus().name(),
                coverLetter.getPreviewUrl(),
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

    // ===================== 초안 저장/수정 =====================

    @Override
    @Transactional
    public Long saveOrUpdateCoverLetter(Long userId,
                                        Long coverLetterId,
                                        CoverLetterReqDto.SaveRequest request) {

        if (coverLetterId == null) {
            // 새로 생성 (POST)
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

        // sections 에 이미 ResumeInput 구조 그대로 들어있다고 가정하고 ResumeData 로 복사
        Map<String, Object> sections = coverLetter.getSections();
        ResumeData data = new ResumeData();

        if (sections != null) {
            Object profile = sections.get("profile");
            if (profile instanceof Map) {
                //noinspection unchecked
                data.setProfile((Map<String, Object>) profile);
            }
            Object experiences = sections.get("experiences");
            if (experiences instanceof List) {
                //noinspection unchecked
                data.setExperiences((List<Map<String, Object>>) experiences);
            }
            Object projects = sections.get("projects");
            if (projects instanceof List) {
                //noinspection unchecked
                data.setProjects((List<Map<String, Object>>) projects);
            }
            Object activities = sections.get("activities");
            if (activities instanceof List) {
                //noinspection unchecked
                data.setActivities((List<Map<String, Object>>) activities);
            }
            Object awards = sections.get("awards");
            if (awards instanceof List) {
                //noinspection unchecked
                data.setAwards((List<Map<String, Object>>) awards);
            }
            Object skills = sections.get("skills");
            if (skills instanceof List) {
                //noinspection unchecked
                data.setSkills((List<String>) skills);
            }
        }

        req.setData(data);

        EssayConfig essay = new EssayConfig();
        // 질문 유형은 일단 기본값 "지원 동기" 로 고정 (나중에 필드 추가해서 바꿀 수 있음)
        essay.setQuestion("지원 동기");
        // 톤/분량은 엔티티 값 사용, 없으면 기본값
        essay.setTone(coverLetter.getTone() != null ? coverLetter.getTone() : "진솔한");
        essay.setLength(coverLetter.getLengthPerQuestion() != null ? coverLetter.getLengthPerQuestion() : 1000);
        req.setEssay(essay);

        // 4) AI 서버 호출
        AiCoverLetterResponse res = aiCoverLetterClient.generate(req);

        String generatedText = (res != null) ? res.getCoverLetter() : null;

        if (generatedText == null || generatedText.isBlank()) {
            coverLetter.setStatus(CoverLetterStatus.FAILED);
            coverLetterRepository.save(coverLetter);
            throw new IllegalStateException("AI가 자소서를 생성하지 못했습니다.");
        }

        // 5) 결과를 sections JSON에 합쳐서 저장
        Map<String, Object> updatedSections = coverLetter.getSections();
        if (updatedSections == null) {
            updatedSections = new HashMap<>();
        }
        updatedSections.put("generatedCoverLetter", generatedText);
        coverLetter.setSections(updatedSections);

        coverLetter.setStatus(CoverLetterStatus.SUCCESS);
        coverLetterRepository.save(coverLetter);
    }

    // ===================== 보관함: 문서 삭제 =====================

    @Override
    @Transactional
    public void deleteCoverLetter(Long userId, Long resumeId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetterRepository.delete(coverLetter);
    }

    // ===================== 보관함: 제목 변경 =====================

    @Override
    @Transactional
    public void updateTitle(Long userId, Long resumeId, String newTitle) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.updateTitle(newTitle);
    }
}
