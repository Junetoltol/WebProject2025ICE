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

    // ===================== 미리보기 & 임시저장 데이터 조회 =====================

    @Override
    public CoverLetterPreviewResponse getCoverLetterPreview(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));

        // 작성 중(PROCESSING)이거나 실패(FAILED)한 상태라도,
        // 사용자가 입력했던 데이터(sections)는 다시 불러와야 수정이 가능하다.
        // 따라서 상태 체크 예외 로직은 제거함.

        return new CoverLetterPreviewResponse(
                coverLetter.getId(),
                coverLetter.getTitle(),
                coverLetter.getQuestions(),
                coverLetter.getTone(),
                coverLetter.getLengthPerQuestion(),
                coverLetter.getStatus() != null ? coverLetter.getStatus().name() : null,
                coverLetter.getPreviewUrl(),
                coverLetter.getSections(), // 저장된 JSON 데이터 반환
                coverLetter.getCreatedAt(),
                coverLetter.getUpdatedAt()
        );
    }

    // ===================== 파일 다운로드 =====================

    @Override
    public Resource downloadCoverLetter(Long coverLetterId, String format, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));

        // 다운로드는 완성된 것만 가능
        if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
            throw new IllegalStateException("Cover letter is not generated yet.");
        }

        String normalized = format == null ? "" : format.toLowerCase();
        if (!normalized.equals("word") && !normalized.equals("pdf")) {
            throw new IllegalArgumentException("Unsupported format.");
        }

        // TODO: 실제 PDF/Word 변환 로직 연동 필요 (현재는 더미 데이터)
        String dummy = "Cover letter " + coverLetter.getId() + " (" + normalized + ")";
        byte[] bytes = dummy.getBytes(StandardCharsets.UTF_8);

        return new ByteArrayResource(bytes);
    }

    // ===================== 보관함 저장 (이미 생성 시 저장되므로 사실상 업데이트 용도) =====================

    @Override
    @Transactional
    public void archiveCoverLetter(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() ->
                        new NoSuchElementException("Cover letter not found."));

        // 이미 생성 시 true로 들어가지만, 명시적인 보관함 저장 요청 시 사용
        coverLetter.setArchived(true);
        coverLetterRepository.save(coverLetter);
    }

    // ===================== 보관함 목록 조회 =====================

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
                        c.getStatus() != null ? c.getStatus().name() : "PROCESSING", // 상태값 추가
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
            // [CREATE] 새로 생성
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

            // 임시 저장 즉시 파일 생성 (보관함 표시)
            coverLetter.setArchived(true);
            coverLetter.setStatus(CoverLetterStatus.PROCESSING);

            return coverLetterRepository.save(coverLetter).getId();
        } else {
            // [UPDATE] 수정
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
    // 메서드 레벨 @Transactional 제거
    // AI 호출 시간이 길어질 수 있으므로, DB 트랜잭션을 쪼개서 관리한다.
    // 그래야 예외 발생 시 'FAILED' 상태 저장이 롤백되지 않는다.
    public void generateCoverLetter(Long userId, Long coverLetterId) {

        // 1) 엔티티 조회
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        // 2) 상태 변경 (PROCESSING) -> 즉시 커밋
        coverLetter.startProcessing();
        coverLetterRepository.save(coverLetter);

        try {
            // 3) AI 요청 데이터 준비
            AiCoverLetterRequest req = new AiCoverLetterRequest();
            Map<String, Object> sections = coverLetter.getSections();
            ResumeData data = new ResumeData();

            // JSON 데이터를 ResumeData 객체로 매핑 (null safe 처리)
            if (sections != null) {
                if (sections.get("profile") instanceof Map)
                    data.setProfile((Map<String, Object>) sections.get("profile"));
                if (sections.get("experiences") instanceof List)
                    data.setExperiences((List<Map<String, Object>>) sections.get("experiences"));
                if (sections.get("projects") instanceof List)
                    data.setProjects((List<Map<String, Object>>) sections.get("projects"));
                if (sections.get("activities") instanceof List)
                    data.setActivities((List<Map<String, Object>>) sections.get("activities"));
                if (sections.get("awards") instanceof List)
                    data.setAwards((List<Map<String, Object>>) sections.get("awards"));
                if (sections.get("skills") instanceof List)
                    data.setSkills((List<String>) sections.get("skills"));
            }
            req.setData(data);

            EssayConfig essay = new EssayConfig();
            essay.setQuestion("지원 동기"); // TODO: 추후 questions 리스트 연동 가능
            essay.setTone(coverLetter.getTone() != null ? coverLetter.getTone() : "진솔한");
            essay.setLength(coverLetter.getLengthPerQuestion() != null ? coverLetter.getLengthPerQuestion() : 1000);
            req.setEssay(essay);

            // 4) AI 서버 호출 (DB 트랜잭션 밖에서 실행)
            AiCoverLetterResponse res = aiCoverLetterClient.generate(req);

            if (res == null || res.getCoverLetter() == null) {
                throw new IllegalStateException("AI returned empty result.");
            }

            // 5) 성공 처리 -> 다시 저장
            // (트랜잭션 밖이라 엔티티가 detach 되었을 수 있으나 save 호출 시 merge 됨)
            Map<String, Object> updatedSections = coverLetter.getSections();
            if (updatedSections == null) {
                updatedSections = new HashMap<>();
            }
            updatedSections.put("generatedCoverLetter", res.getCoverLetter());
            coverLetter.setSections(updatedSections);
            
            coverLetter.completeGeneration(null); // previewUrl은 추후 생성되면 넣기
            coverLetterRepository.save(coverLetter);

        } catch (Exception e) {
            // 6) 실패 처리 -> 즉시 저장 (Rollback 되지 않음)
            coverLetter.setStatus(CoverLetterStatus.FAILED);
            coverLetterRepository.save(coverLetter);
            
            // 컨트롤러나 상위 로직에 알리기 위해 예외를 다시 던짐
            throw new RuntimeException("Cover letter generation failed", e);
        }
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

    // ===================== 완성된 자소서 내용 수정 =====================

    @Override
    @Transactional
    public void updateGeneratedContent(Long userId, Long coverLetterId, String content) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        Map<String, Object> sections = coverLetter.getSections();
        if (sections == null) {
            sections = new HashMap<>();
        }
        sections.put("generatedCoverLetter", content);
        coverLetter.setSections(sections);

        coverLetterRepository.save(coverLetter);
    }
}