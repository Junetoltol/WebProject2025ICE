package com.jobbuddy.backend.service;
//만든놈 최은준

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
