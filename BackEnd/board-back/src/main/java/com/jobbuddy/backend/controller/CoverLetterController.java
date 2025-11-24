package com.jobbuddy.backend.controller;
//만든놈 최은준
import com.jobbuddy.backend.dto.CoverLetterPreviewResponse;
import com.jobbuddy.backend.service.CoverLetterService;
import com.jobbuddy.backend.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import com.jobbuddy.backend.dto.CoverLetterListItemResponse;
import com.jobbuddy.backend.dto.PageResponse;


import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/cover-letters")
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    public CoverLetterController(CoverLetterService coverLetterService) {
        this.coverLetterService = coverLetterService;
    }

    // 자소서 미리보기 조회
    @GetMapping("/{coverLetterId}")
    public ResponseEntity<ApiResponse<CoverLetterPreviewResponse>> getCoverLetterPreview(
            @PathVariable Long coverLetterId,
            // TODO: 나중에 JWT에서 userId 꺼내도록 변경
            @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            CoverLetterPreviewResponse preview =
                    coverLetterService.getCoverLetterPreview(coverLetterId, userId);

            ApiResponse<CoverLetterPreviewResponse> body =
                    new ApiResponse<>(200, "자소서 조회 성공.", preview);

            return ResponseEntity.ok(body);

        } catch (NoSuchElementException e) {
            // 자소서 없음 → 404
            ApiResponse<CoverLetterPreviewResponse> body =
                    new ApiResponse<>(404, "Cover letter not found.", null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);

        } catch (IllegalStateException e) {
            // 아직 미생성 상태 → 409
            ApiResponse<CoverLetterPreviewResponse> body =
                    new ApiResponse<>(409, "Cover letter is not generated yet.", null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        }
    }

        // 자소서 파일 다운로드 (word / pdf)
    @GetMapping("/{coverLetterId}/download")
    public ResponseEntity<Resource> downloadCoverLetter(
            @PathVariable Long coverLetterId,
            @RequestParam String format,
            @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            Resource file = coverLetterService.downloadCoverLetter(coverLetterId, format, userId);

            String lower = format.toLowerCase();
            String contentType = lower.equals("pdf")
                    ? "application/pdf"
                    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            String extension = lower.equals("pdf") ? ".pdf" : ".docx";
            String filename = "cover-letter-" + coverLetterId + extension;

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(file);

        } catch (IllegalArgumentException e) {
            // 지원하지 않는 format = 400
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        } catch (NoSuchElementException e) {
            // 존재하지 않는 자소서 = 404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        } catch (IllegalStateException e) {
            // 아직 생성 안 됨 = 409
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
        // 자소서 보관함 저장
    @PostMapping("/{coverLetterId}/archive")
    public ResponseEntity<ApiResponse<ArchiveResponse>> archiveCoverLetter(
            @PathVariable Long coverLetterId,
            @RequestHeader("X-User-Id") Long userId
    ) {
        try {
            coverLetterService.archiveCoverLetter(coverLetterId, userId);

            ArchiveResponse data = new ArchiveResponse(coverLetterId, true);
            ApiResponse<ArchiveResponse> body =
                    new ApiResponse<>(200, "보관함에 저장되었습니다.", data);

            return ResponseEntity.ok(body);

        } catch (NoSuchElementException e) {
            ApiResponse<ArchiveResponse> body =
                    new ApiResponse<>(404, "Cover letter not found.", null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);

        } catch (IllegalStateException e) {
            ApiResponse<ArchiveResponse> body =
                    new ApiResponse<>(409, "Cover letter is not generated yet.", null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        }
    }

    // 보관함 저장 응답용 작은 DTO
    public static class ArchiveResponse {
        private Long coverLetterId;
        private boolean archived;

        public ArchiveResponse(Long coverLetterId, boolean archived) {
            this.coverLetterId = coverLetterId;
            this.archived = archived;
        }

        public Long getCoverLetterId() { return coverLetterId; }
        public boolean isArchived() { return archived; }
        public void setCoverLetterId(Long coverLetterId) { this.coverLetterId = coverLetterId; }
        public void setArchived(boolean archived) { this.archived = archived; }
    }
        // 보관함 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CoverLetterListItemResponse>>> getArchivedCoverLetters(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "tone", required = false) String tone,
            @RequestParam(value = "sort", defaultValue = "updatedAt,desc") String sort,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size
    ) {
        try {
            PageResponse<CoverLetterListItemResponse> pageResult =
                    coverLetterService.getArchivedCoverLetters(userId, q, tone, sort, page, size);

            ApiResponse<PageResponse<CoverLetterListItemResponse>> body =
                    new ApiResponse<>(200, "목록 조회 성공.", pageResult);

            return ResponseEntity.ok(body);

        } catch (Exception e) {
            // DB 문제 등 서버 에러
            ApiResponse<PageResponse<CoverLetterListItemResponse>> body =
                    new ApiResponse<>(500, "Database error.", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }



}
