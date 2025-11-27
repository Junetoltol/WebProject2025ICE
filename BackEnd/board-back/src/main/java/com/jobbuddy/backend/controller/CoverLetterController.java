package com.jobbuddy.backend.controller;

import com.jobbuddy.backend.dto.ApiResponse;
import com.jobbuddy.backend.dto.CoverLetterListItemResponse;
import com.jobbuddy.backend.dto.CoverLetterPreviewResponse;
import com.jobbuddy.backend.dto.CoverLetterReqDto;
import com.jobbuddy.backend.dto.PageResponse;
import com.jobbuddy.backend.service.CoverLetterService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.jobbuddy.backend.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/cover-letters")
public class CoverLetterController {

    private final CoverLetterService coverLetterService;
    private final UserRepository userRepository;

    public CoverLetterController(
            CoverLetterService coverLetterService,
            UserRepository userRepository) {
        this.coverLetterService = coverLetterService;
        this.userRepository = userRepository;
    }

    // ===== 공통: Authentication -> userId(Long) 변환 =====
    private Long getUserId(Authentication authentication) {
        if (authentication == null) {
            throw new SecurityException("Unauthorized");
        }

        // 토큰에 들어있는 값 = username (지금 JTT 같은 값)
        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + username))
                .getId();
    }

    // ===== 1. 자소서 초안 작성 (POST /api/cover-letters) =====
    @PostMapping
    public ResponseEntity<ApiResponse<CoverLetterReqDto.IdResponse>> createCoverLetter(
            Authentication authentication,
            @RequestBody CoverLetterReqDto.SaveRequest request) {
        Long userId = getUserId(authentication);
        Long id = coverLetterService.saveOrUpdateCoverLetter(userId, null, request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "자기소개서 작성 정보가 저장되었습니다.",
                        new CoverLetterReqDto.IdResponse(id)));
    }

    // ===== 1-2. 자소서 수정 (PATCH /api/cover-letters/{coverLetterId}) =====
    @PatchMapping("/{coverLetterId}")
    public ResponseEntity<ApiResponse<CoverLetterReqDto.IdResponse>> updateCoverLetter(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestBody CoverLetterReqDto.SaveRequest request) {
        Long userId = getUserId(authentication);
        Long id = coverLetterService.saveOrUpdateCoverLetter(userId, coverLetterId, request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "자기소개서 작성 정보가 업데이트 되었습니다.",
                        new CoverLetterReqDto.IdResponse(id)));
    }

    // ===== 2. 템플릿 선택 (PUT /api/cover-letters/{coverLetterId}/template) =====
    @PutMapping("/{coverLetterId}/template")
    public ResponseEntity<ApiResponse<Map<String, Object>>> selectTemplate(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestBody TemplateRequest request) {
        Long userId = getUserId(authentication);
        coverLetterService.updateTemplate(userId, coverLetterId, request.getTemplateId());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "템플릿이 적용되었습니다.",
                        Map.of("coverLetterId", coverLetterId, "templateId", request.getTemplateId())));
    }

    // ===== 3. 자소서 미리보기 조회 (GET /api/cover-letters/{coverLetterId}) =====
    @GetMapping("/{coverLetterId}")
    public ResponseEntity<ApiResponse<CoverLetterPreviewResponse>> getCoverLetterDetail(
            Authentication authentication,
            @PathVariable Long coverLetterId) {
        Long userId = getUserId(authentication);
        try {
            CoverLetterPreviewResponse response = coverLetterService.getCoverLetterPreview(coverLetterId, userId);

            return ResponseEntity.ok(
                    new ApiResponse<>(200, "자소서 조회 성공.", response));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "Cover letter not found.", null));
        }
    }

    // ===== 4. 구성 설정 저장 (POST /api/cover-letters/{coverLetterId}/settings) =====
    @PostMapping("/{coverLetterId}/settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> saveSettings(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestBody SettingsRequest request) {
        Long userId = getUserId(authentication);

        coverLetterService.updateSettings(
                userId,
                coverLetterId,
                request.getQuestions(),
                request.getTone(),
                request.getLengthPerQuestion());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "자소서 설정이 저장되었습니다.",
                        Map.of(
                                "coverLetterId", coverLetterId,
                                "tone", request.getTone(),
                                "lengthPerQuestion", request.getLengthPerQuestion())));
    }

    // ===== 5. 생성 요청 (POST /api/cover-letters/{coverLetterId}/generate) =====
    @PostMapping("/{coverLetterId}/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateCoverLetter(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestBody(required = false) GenerateRequest request) {
        Long userId = getUserId(authentication);
        coverLetterService.generateCoverLetter(userId, coverLetterId);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>(
                        200,
                        "자소서 생성 요청이 접수되었습니다.",
                        Map.of("coverLetterId", coverLetterId, "status", "PROCESSING")));
    }

    // ===== 6. 파일 다운로드 (GET
    // /api/cover-letters/{coverLetterId}/download?format=pdf|word) =====
    @GetMapping("/{coverLetterId}/download")
    public ResponseEntity<Resource> downloadCoverLetter(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestParam String format) {
        Long userId = getUserId(authentication);
        try {
            Resource file = coverLetterService.downloadCoverLetter(coverLetterId, format, userId);

            String contentType = format.equalsIgnoreCase("pdf")
                    ? "application/pdf"
                    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            String extension = format.equalsIgnoreCase("pdf") ? ".pdf" : ".docx";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"cover-letter-" + coverLetterId + extension + "\"")
                    .body(file);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ===== 7. 보관함 저장 (POST /api/cover-letters/{coverLetterId}/archive) =====
    @PostMapping("/{coverLetterId}/archive")
    public ResponseEntity<ApiResponse<Map<String, Object>>> archiveCoverLetter(
            Authentication authentication,
            @PathVariable Long coverLetterId) {
        Long userId = getUserId(authentication);
        try {
            coverLetterService.archiveCoverLetter(coverLetterId, userId);
            return ResponseEntity.ok(
                    new ApiResponse<>(
                            200,
                            "보관함에 저장되었습니다.",
                            Map.of("coverLetterId", coverLetterId, "archived", true)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "Not found", null));
        }
    }

    // ===== 8. 보관함 목록 (GET /api/cover-letters?q=&tone=&sort=&page=&size=) =====
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CoverLetterListItemResponse>>> getArchivedCoverLetters(
            Authentication authentication,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tone,
            @RequestParam(defaultValue = "updatedAt,desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Long userId = getUserId(authentication);

        PageResponse<CoverLetterListItemResponse> response = coverLetterService.getArchivedCoverLetters(userId, q, tone,
                sort, page, size);

        return ResponseEntity.ok(
                new ApiResponse<>(200, "목록 조회 성공.", response));
    }

    // ===== 9. 보관함 문서 삭제 (DELETE /api/cover-letters/{coverLetterId}) =====
    @DeleteMapping("/{coverLetterId}")
    public ResponseEntity<ApiResponse<Void>> deleteCoverLetter(
            Authentication authentication,
            @PathVariable Long coverLetterId) {
        Long userId = getUserId(authentication);
        try {
            coverLetterService.deleteCoverLetter(userId, coverLetterId);
            return ResponseEntity.ok(
                    new ApiResponse<>(200, "자기소개서가 성공적으로 삭제되었습니다.", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 자기소개서를 찾을 수 없습니다.", null));
        }
    }

    // ===== 10. 보관함 문서 이름 변경 (PATCH /api/cover-letters/{coverLetterId}/title) =====
    @PatchMapping("/{coverLetterId}/title")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateTitle(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestBody TitleUpdateRequest request) {
        Long userId = getUserId(authentication);
        try {
            coverLetterService.updateTitle(userId, coverLetterId, request.getTitle());

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            200,
                            "자기소개서 제목이 성공적으로 변경되었습니다.",
                            Map.of("coverLetterId", coverLetterId, "title", request.getTitle())));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 자기소개서를 찾을 수 없습니다.", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, "제목은 1자 이상 100자 이하로 입력해주세요.", null));
        }
    }

    // ===== 내부 요청 DTO들 =====

    // 템플릿 선택용
    public static class TemplateRequest {
        private String templateId;

        public String getTemplateId() {
            return templateId;
        }

        public void setTemplateId(String templateId) {
            this.templateId = templateId;
        }
    }

    // 설정 저장용
    public static class SettingsRequest {
        private List<String> questions;
        private String tone;
        private Integer lengthPerQuestion;

        public List<String> getQuestions() {
            return questions;
        }

        public void setQuestions(List<String> questions) {
            this.questions = questions;
        }

        public String getTone() {
            return tone;
        }

        public void setTone(String tone) {
            this.tone = tone;
        }

        public Integer getLengthPerQuestion() {
            return lengthPerQuestion;
        }

        public void setLengthPerQuestion(Integer lengthPerQuestion) {
            this.lengthPerQuestion = lengthPerQuestion;
        }
    }

    // 생성 요청 바디 (필요시 옵션 넣을 수 있음)
    public static class GenerateRequest {
        private String mode; // 예: "sync", "async" 등 확장 여지

        public String getMode() {
            return mode;
        }

        public void setMode(String mode) {
            this.mode = mode;
        }
    }

    // 제목 변경
    public static class TitleUpdateRequest {
        private String title;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }
    }

    // 완성된 자소서 내용 수정 (PUT /api/cover-letters/{id}/content)
    @PutMapping("/{coverLetterId}/content")
    public ResponseEntity<ApiResponse<Void>> updateCoverLetterContent(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestBody ContentUpdateRequest request) {
        Long userId = getUserId(authentication);
        coverLetterService.updateGeneratedContent(userId, coverLetterId, request.getContent());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        200,
                        "자기소개서 내용이 수정되었습니다.",
                        null));
    }

    // 내부 DTO
    public static class ContentUpdateRequest {
        private String content; // 혹은 sections 구조 전체

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

}
