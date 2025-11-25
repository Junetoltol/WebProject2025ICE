package com.jobbuddy.backend.service;

import com.jobbuddy.backend.dto.CoverLetterPreviewResponse;
import com.jobbuddy.backend.dto.CoverLetterListItemResponse;
import com.jobbuddy.backend.dto.PageResponse;
import org.springframework.core.io.Resource;

public interface CoverLetterService {

    /**
     * 자소서 미리보기 조회
     *
     * @param coverLetterId  자소서 ID (path variable)
     * @param userId         로그인한 사용자 ID (JWT에서 꺼낼 예정)
     */
    CoverLetterPreviewResponse getCoverLetterPreview(Long coverLetterId, Long userId);

    /**
     * 자소서 파일 다운로드 (word / pdf)
     */
    Resource downloadCoverLetter(Long coverLetterId, String format, Long userId);

    /**
     * 자소서를 보관함에 저장
     */
    void archiveCoverLetter(Long coverLetterId, Long userId);

    /**
     * 보관함 목록 조회
     *
     * @param userId 로그인한 사용자 ID
     * @param q      검색어(옵션)
     * @param tone   톤 필터(옵션)
     * @param sort   정렬 기준 예) "updatedAt,desc"
     * @param page   페이지 번호 (0-base)
     * @param size   페이지 크기
     */
    PageResponse<CoverLetterListItemResponse> getArchivedCoverLetters(
            Long userId,
            String q,
            String tone,
            String sort,
            int page,
            int size
    );
}


    // 1. 자소서 저장/수정 (POST, PATCH)
    @org.springframework.transaction.annotation.Transactional
    public Long saveOrUpdateCoverLetter(Long userId, Long coverLetterId, com.jobbuddy.backend.dto.CoverLetterReqDto.SaveRequest request) {
        if (coverLetterId == null) {
            // 새로 생성 (POST)
            // User 엔티티 조회 필요 (Repository 활용)
            // 여기서는 기존 코드 스타일에 맞춰 User 객체 조회 로직이 있다고 가정하거나, 
            // CoverLetter 생성자를 보완해야 함. 기존 코드를 최소한으로 건드리기 위해 빌더나 세터 활용.
            // *주의*: 기존 CoverLetter에 적절한 생성자가 없다면 기본 생성자 후 Setter 사용
            
            // User 조회 (기존 userRepository 사용)
            com.jobbuddy.backend.model.User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            com.jobbuddy.backend.model.CoverLetter coverLetter = new com.jobbuddy.backend.model.CoverLetter();
            coverLetter.setOwner(user); // 기존 Setter 활용
            coverLetter.updateContent(request.getTitle(), request.getTargetCompany(), request.getTargetJob(), request.getSections());
            coverLetter.setStatus(com.jobbuddy.backend.model.CoverLetterStatus.PROCESSING); // 초기 상태값 (필요시 변경)
            
            return coverLetterRepository.save(coverLetter).getId();
        } else {
            // 수정 (PATCH)
            com.jobbuddy.backend.model.CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                    .orElseThrow(() -> new java.util.NoSuchElementException("Cover letter not found"));
            
            coverLetter.updateContent(request.getTitle(), request.getTargetCompany(), request.getTargetJob(), request.getSections());
            return coverLetter.getId();
        }
    }

    // 2. 템플릿 선택 (PUT)
    @org.springframework.transaction.annotation.Transactional
    public void updateTemplate(Long userId, Long resumeId, String templateId) {
        com.jobbuddy.backend.model.CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Cover letter not found"));
        coverLetter.updateTemplate(templateId);
    }

    // 4. 설정 저장 (POST)
    @org.springframework.transaction.annotation.Transactional
    public void updateSettings(Long userId, Long coverLetterId, java.util.List<String> questions, String tone, Integer length) {
        com.jobbuddy.backend.model.CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Cover letter not found"));
        // 기존 엔티티에 setQuestions 등이 있다면 사용, 없다면 필드 직접 할당하거나 메서드 추가 필요
        coverLetter.setQuestions(questions);
        coverLetter.setTone(tone);
        coverLetter.setLengthPerQuestion(length);
    }

    // 5. 생성 요청 (POST /generate)
    @org.springframework.transaction.annotation.Transactional
    public void generateCoverLetter(Long userId, Long coverLetterId) {
        com.jobbuddy.backend.model.CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(coverLetterId, userId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Cover letter not found"));
        
        // 상태 변경
        coverLetter.startProcessing();
        
        // TODO: 실제 AI 생성 로직 연동 (비동기 처리 권장)
    }

    // [보관함] 문서 삭제
    @org.springframework.transaction.annotation.Transactional
    public void deleteCoverLetter(Long userId, Long resumeId) {
        com.jobbuddy.backend.model.CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Cover letter not found"));
        
        coverLetterRepository.delete(coverLetter);
    }

    // [보관함] 문서 이름 변경
    @org.springframework.transaction.annotation.Transactional
    public void updateTitle(Long userId, Long resumeId, String newTitle) {
        com.jobbuddy.backend.model.CoverLetter coverLetter = coverLetterRepository.findByIdAndOwnerId(resumeId, userId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Cover letter not found"));
        
        coverLetter.updateTitle(newTitle);
    }
