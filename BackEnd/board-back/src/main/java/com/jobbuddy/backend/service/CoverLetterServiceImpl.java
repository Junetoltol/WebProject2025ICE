package com.jobbuddy.backend.service;

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
    // (1) intro_info: 임시 저장 결과물 가져오기
    // (3) intro_loading: 상태(status) 확인해서 다음 페이지 갈지 결정하기
    // (5) store_intro: 수정하기 버튼 눌렀을 때 데이터 로드 / 작성자 이름 표시
    // =================================================================================
    @Override
    @Transactional(readOnly = true)
    public CoverLetterPreviewResponse getCoverLetterPreview(Long coverLetterId, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() -> new NoSuchElementException("Cover letter not found."));

        // (5) 작성자 이름 가져오기
        String ownerName = coverLetter.getOwner().getName();

        // (1), (5) sections(JSON 데이터)를 그대로 반환해서 프론트가 input에 채워 넣게 함
        // (3) status를 반환해서 프론트가 "SUCCESS"면 페이지 이동하게 함
        return new CoverLetterPreviewResponse(
                coverLetter.getId(),
                coverLetter.getTitle(),
                coverLetter.getQuestions(),
                coverLetter.getTone(),
                coverLetter.getLengthPerQuestion(),
                coverLetter.getStatus() != null ? coverLetter.getStatus().name() : "PROCESSING",
                coverLetter.getPreviewUrl(),
                coverLetter.getSections(), // 입력했던 데이터
                ownerName,                 // 작성자 이름
                coverLetter.getCreatedAt(),
                coverLetter.getUpdatedAt() // (5) 수정 날짜
        );
    }

    // =================================================================================
    // (1) intro_info: 개인 정보들을 모두 백엔드로 보내는 기능 (임시 저장)
    // =================================================================================
    @Override
    @Transactional
    public Long saveOrUpdateCoverLetter(Long userId,
                                        Long coverLetterId,
                                        CoverLetterReqDto.SaveRequest request) {
        if (coverLetterId == null) {
            // [신규 생성]
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            CoverLetter coverLetter = new CoverLetter();
            coverLetter.setOwner(user);
            coverLetter.updateContent(
                    request.getTitle(),
                    request.getTargetCompany(),
                    request.getTargetJob(),
                    request.getSections() // 프론트에서 보낸 JSON 통째로 저장
            );
            
            // 임시 저장 버튼 누른 순간부터 보관함에는 보여야 함 (기획 의도상)
            coverLetter.setArchived(true); 
            coverLetter.setStatus(CoverLetterStatus.PROCESSING); // 아직 생성 전이므로 진행중 상태

            return coverLetterRepository.save(coverLetter).getId();
        } else {
            // [수정/덮어쓰기]
            CoverLetter coverLetter =
                    coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                            .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

            coverLetter.updateContent(
                    request.getTitle(),
                    request.getTargetCompany(),
                    request.getTargetJob(),
                    request.getSections()
            );
            // 날짜는 Entity의 @PreUpdate 때문에 자동으로 현재 시간으로 바뀜 ((5)번 기능 해결)
            
            return coverLetter.getId();
        }
    }

    // =================================================================================
    // (2) intro_config: 방식 설정 후 넘기는 기능
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
        // 설정 저장 후, 프론트에서 바로 generate API를 호출하게 됨
    }

    // =================================================================================
    // (2) intro_config: 생성 버튼 눌렀을 때 생성 요청 보내기 기능
    // (3) intro_loading: AI가 글을 완성하면 상태를 SUCCESS로 변경 (프론트가 이걸 감지)
    // =================================================================================
    @Override
    public void generateCoverLetter(Long userId, Long coverLetterId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        // [트랜잭션 1단계] 상태를 '생성 중'으로 변경하고 커밋
        coverLetter.startProcessing();
        coverLetterRepository.save(coverLetter);

        try {
            // [트랜잭션 없음] AI 요청 (시간 오래 걸림)
            AiCoverLetterRequest req = new AiCoverLetterRequest();
            Map<String, Object> sections = coverLetter.getSections();
            ResumeData data = new ResumeData();
            
            // JSON -> 객체 매핑 (Null 방어 로직)
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

            // AI 호출
            AiCoverLetterResponse res = aiCoverLetterClient.generate(req);

            if (res == null || res.getCoverLetter() == null) {
                throw new IllegalStateException("AI Response is empty");
            }

            // [트랜잭션 2단계] 결과 저장 (SUCCESS 상태로 변경)
            // (3)번 기능: 여기서 상태가 SUCCESS가 되므로, 프론트의 폴링 로직이 이걸 보고 페이지를 넘김
            Map<String, Object> updatedSections = coverLetter.getSections();
            if (updatedSections == null) updatedSections = new HashMap<>();
            
            // 생성된 자소서 내용을 JSON에 추가
            updatedSections.put("generatedCoverLetter", res.getCoverLetter());
            coverLetter.setSections(updatedSections);
            
            coverLetter.completeGeneration(null); 
            coverLetterRepository.save(coverLetter);

        } catch (Exception e) {
            // 실패 시 FAILED 저장 (프론트에서 에러 처리 가능하게)
            coverLetter.setStatus(CoverLetterStatus.FAILED);
            coverLetterRepository.save(coverLetter);
            throw new RuntimeException("Generation failed", e);
        }
    }

    // =================================================================================
    // (4) intro_download: 워드/피뎊 다운로드 기능
    // (5) store_intro: 다운로드 버튼 기능
    // =================================================================================
    @Override
    public Resource downloadCoverLetter(Long coverLetterId, String format, Long userId) {
        CoverLetter coverLetter = coverLetterRepository
                .findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() -> new NoSuchElementException("Cover letter not found."));

        if (coverLetter.getStatus() != CoverLetterStatus.SUCCESS) {
            throw new IllegalStateException("Not generated yet.");
        }

        // 실제 AI가 생성한 텍스트 꺼내기
        String content = "";
        if (coverLetter.getSections() != null && coverLetter.getSections().containsKey("generatedCoverLetter")) {
            content = coverLetter.getSections().get("generatedCoverLetter").toString();
        } else {
            content = "내용이 없습니다.";
        }

        // PDF/Word 라이브러리가 없으므로 텍스트 기반 파일 생성 (확장자는 컨트롤러가 처리)
        // 실제로는 여기서 iText나 POI 라이브러리로 변환 로직이 들어감
        String fileContent = "제목: " + coverLetter.getTitle() + "\n\n" + content;
        byte[] bytes = fileContent.getBytes(StandardCharsets.UTF_8);

        return new ByteArrayResource(bytes);
    }

    // =================================================================================
    // (5) store_intro: 삭제하기 버튼 기능
    // =================================================================================
    @Override
    @Transactional
    public void deleteCoverLetter(Long userId, Long resumeId) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetterRepository.delete(coverLetter); // DB에서 완전 삭제
    }

    // =================================================================================
    // (5) store_intro: 각 자소서의 이름으로 표시되는 기능 (제목 변경 포함)
    // =================================================================================
    @Override
    @Transactional
    public void updateTitle(Long userId, Long resumeId, String newTitle) {
        CoverLetter coverLetter =
                coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                        .orElseThrow(() -> new NoSuchElementException("Cover letter not found"));

        coverLetter.updateTitle(newTitle); // 엔티티 메서드가 updatedAt도 갱신함
    }

    // (기타 보관함 목록 조회 등의 메서드는 기존 코드 유지 - 변경 없음)
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

        var content = pageResult.getContent().stream()
                .map(c -> new CoverLetterListItemResponse(
                        c.getId(),
                        c.getTitle(),
                        c.getPreviewUrl(),
                        c.getStatus() != null ? c.getStatus().name() : "PROCESSING",
                        c.getUpdatedAt() // (5) 수정한 날짜 자동 변경된 것 조회
                ))
                .collect(Collectors.toList());

        return new PageResponse<>(content, pageResult.getNumber(), pageResult.getSize(), pageResult.getTotalElements(), pageResult.getTotalPages());
    }

    // 템플릿 선택 및 완성된 내용 수정 기능 유지
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
    
    // (1), (5) 보관함 저장은 생성시/수정시 자동 처리되지만 명시적 메서드도 유지
    @Override
    @Transactional
    public void archiveCoverLetter(Long coverLetterId, Long userId) {
         CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId).orElseThrow();
         coverLetter.setArchived(true);
    }
}