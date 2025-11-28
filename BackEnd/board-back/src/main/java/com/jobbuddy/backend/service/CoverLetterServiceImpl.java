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
                .orElseThrow(() -> new NoSuchElementException("Cover letter not found."));

        String ownerName = coverLetter.getOwner().getName();

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
                ownerName,                 // String
                coverLetter.getCreatedAt(),
                coverLetter.getUpdatedAt()
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
            coverLetter.setArchived(true);
            coverLetter.setStatus(CoverLetterStatus.PROCESSING);
            return coverLetterRepository.save(coverLetter).getId();
        } else {
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

    // =================================================================================
    // (2) 설정 저장
    // =================================================================================
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

    // =================================================================================
    // (2), (3) 생성 요청
    // =================================================================================
    @Override
    public void generateCoverLetter(Long userId, Long coverLetterId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.startProcessing();
        coverLetterRepository.save(coverLetter);

        try {
            AiCoverLetterRequest req = new AiCoverLetterRequest();
            Map<String, Object> sections = coverLetter.getSections();
            ResumeData data = new ResumeData();

            if (sections != null) {
                if (sections.get("profile") instanceof Map) data.setProfile((Map) sections.get("profile"));
                if (sections.get("experiences") instanceof List) data.setExperiences((List) sections.get("experiences"));
                if (sections.get("projects") instanceof List) data.setProjects((List) sections.get("projects"));
                if (sections.get("activities") instanceof List) data.setActivities((List) sections.get("activities"));
                if (sections.get("awards") instanceof List) data.setAwards((List) sections.get("awards"));
                if (sections.get("skills") instanceof List) data.setSkills((List) sections.get("skills"));
            }
            req.setData(data);

            EssayConfig essay = new EssayConfig();
            essay.setQuestion("지원 동기");
            essay.setTone(coverLetter.getTone() != null ? coverLetter.getTone() : "진솔한");
            essay.setLength(coverLetter.getLengthPerQuestion() != null ? coverLetter.getLengthPerQuestion() : 1000);
            req.setEssay(essay);

            AiCoverLetterResponse res = aiCoverLetterClient.generate(req);

            if (res == null || res.getCoverLetter() == null) {
                throw new IllegalStateException("AI Response is empty");
            }

            Map<String, Object> updatedSections = coverLetter.getSections();
            if (updatedSections == null) updatedSections = new HashMap<>();
            
            updatedSections.put("generatedCoverLetter", res.getCoverLetter());
            coverLetter.setSections(updatedSections);
            
            coverLetter.completeGeneration(null);
            coverLetterRepository.save(coverLetter);

        } catch (Exception e) {
            coverLetter.setStatus(CoverLetterStatus.FAILED);
            coverLetterRepository.save(coverLetter);
            throw new RuntimeException("Generation failed", e);
        }
    }

    // =================================================================================
    // (4) 다운로드
    // =================================================================================
    @Override
    public Resource downloadCoverLetter(Long coverLetterId, String format, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() -> new NoSuchElementException("Cover letter not found."));

        if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
            throw new IllegalStateException("Not generated yet.");
        }

        String content = "";
        if (coverLetter.getSections() != null && coverLetter.getSections().containsKey("generatedCoverLetter")) {
            content = coverLetter.getSections().get("generatedCoverLetter").toString();
        } else {
            content = "내용이 없습니다.";
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
        CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId).orElseThrow();
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