package com.jobbuddy.backend.controller;

import com.jobbuddy.backend.dto.*;
import com.jobbuddy.backend.service.CoverLetterService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
public class CoverLetterController {

    private final CoverLetterService coverLetterService;

    public CoverLetterController(CoverLetterService coverLetterService) {
        this.coverLetterService = coverLetterService;
    }

    // Helper: SecurityContext에서 인증된 사용자 이름(ID) 추출
    private String getUsername(Authentication authentication) {
        if (authentication == null) throw new SecurityException("Unauthorized");
        return authentication.getName();
    }

    // --- 1. 자소서 초안 작성 ---
    @PostMapping("/cover-letters")
    public ResponseEntity<ApiResponse<CoverLetterDto.IdResponse>> createCoverLetter(
            Authentication authentication,
            @RequestBody CoverLetterDto.SaveRequest request) {
        
        Long id = coverLetterService.saveCoverLetter(getUsername(authentication), request);
        return ResponseEntity.ok(new ApiResponse<>(200, "자기소개서 작성 정보가 저장되었습니다", new CoverLetterDto.IdResponse(id)));
    }

    // --- 1-2. 자소서 수정 ---
    @PatchMapping("/cover-letters/{coverLetterId}")
    public ResponseEntity<ApiResponse<CoverLetterDto.IdResponse>> updateCoverLetter(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestBody CoverLetterDto.SaveRequest request) {
        
        Long id = coverLetterService.updateCoverLetter(getUsername(authentication), coverLetterId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, "자기소개서 작성 정보가 업데이트 되었습니다", new CoverLetterDto.IdResponse(id)));
    }

    // --- 2. 템플릿 선택 ---
    @PutMapping("/resumes/{resumeId}/template")
    public ResponseEntity<ApiResponse<Map<String, Object>>> selectTemplate(
            Authentication authentication,
            @PathVariable Long resumeId,
            @RequestBody CoverLetterDto.TemplateRequest request) {
        
        coverLetterService.updateTemplate(getUsername(authentication), resumeId, request.getTemplateId());
        
        return ResponseEntity.ok(new ApiResponse<>(200, "템플릿이 적용되었습니다.",
                Map.of("resumeId", resumeId, "templateId", request.getTemplateId())));
    }

    // --- 3. 이력서 전체 조회 ---
    @GetMapping("/resumes")
    public ResponseEntity<ApiResponse<List<CoverLetterListItemResponse>>> getAllResumes(Authentication authentication) {
        List<CoverLetterListItemResponse> list = coverLetterService.getAllMyCoverLetters(getUsername(authentication));
        return ResponseEntity.ok(new ApiResponse<>(200, "이력서 조회 성공.", list));
    }
    
    // --- 3-1. 이력서 상세 조회 ---
    @GetMapping("/cover-letters/{coverLetterId}")
    public ResponseEntity<ApiResponse<CoverLetterPreviewResponse>> getCoverLetterDetail(
            Authentication authentication,
            @PathVariable Long coverLetterId) {
        try {
            CoverLetterPreviewResponse response = coverLetterService.getCoverLetterPreview(coverLetterId, getUsername(authentication));
            return ResponseEntity.ok(new ApiResponse<>(200, "자소서 조회 성공.", response));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(404, "Cover letter not found.", null));
        }
    }

    // --- 4. 설정 저장 ---
    @PostMapping("/cover-letters/{coverLetterId}/settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> saveSettings(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestBody CoverLetterDto.SettingRequest request) {
        
        coverLetterService.updateSettings(getUsername(authentication), coverLetterId, request);
        return ResponseEntity.ok(new ApiResponse<>(200, "자소서 설정이 저장되었습니다.",
                Map.of("coverLetterId", coverLetterId, "tone", request.getTone())));
    }

    // --- 5. 생성 요청 ---
    @PostMapping("/cover-letters/{coverLetterId}/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateCoverLetter(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestBody(required = false) CoverLetterDto.GenerateRequest request) {
        
        coverLetterService.generateCoverLetter(getUsername(authentication), coverLetterId);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse<>(200, "자소서 생성 요청이 접수되었습니다.",
                        Map.of("coverLetterId", coverLetterId, "status", "PROCESSING")));
    }

    // --- 다운로드 ---
    @GetMapping("/cover-letters/{coverLetterId}/download")
    public ResponseEntity<Resource> downloadCoverLetter(
            Authentication authentication,
            @PathVariable Long coverLetterId,
            @RequestParam String format) {
        try {
            Resource file = coverLetterService.downloadCoverLetter(coverLetterId, format, getUsername(authentication));
            String contentType = format.equalsIgnoreCase("pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            String extension = format.equalsIgnoreCase("pdf") ? ".pdf" : ".docx";
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cover-letter-" + coverLetterId + extension + "\"")
                    .body(file);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // --- 보관함 저장 ---
    @PostMapping("/cover-letters/{coverLetterId}/archive")
    public ResponseEntity<ApiResponse<Map<String, Object>>> archiveCoverLetter(
            Authentication authentication,
            @PathVariable Long coverLetterId) {
        try {
            coverLetterService.archiveCoverLetter(coverLetterId, getUsername(authentication));
            return ResponseEntity.ok(new ApiResponse<>(200, "보관함에 저장되었습니다.", Map.of("coverLetterId", coverLetterId, "archived", true)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(404, "Not found", null));
        }
    }

    // --- 보관함 목록 ---
    @GetMapping("/cover-letters")
    public ResponseEntity<ApiResponse<PageResponse<CoverLetterListItemResponse>>> getArchivedCoverLetters(
            Authentication authentication,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tone,
            @RequestParam(defaultValue = "updatedAt,desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        PageResponse<CoverLetterListItemResponse> response = 
            coverLetterService.getArchivedCoverLetters(getUsername(authentication), q, tone, sort, page, size);
        return ResponseEntity.ok(new ApiResponse<>(200, "목록 조회 성공.", response));
    }

    // --- [New] 보관함 문서 삭제 (DELETE /api/resumes/{resumeId}) ---
    @DeleteMapping("/resumes/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteCoverLetter(
            Authentication authentication,
            @PathVariable Long resumeId) {
        try {
            coverLetterService.deleteCoverLetter(getUsername(authentication), resumeId);
            return ResponseEntity.ok(new ApiResponse<>(200, "자기소개서가 성공적으로 삭제되었습니다.", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 자기소개서를 찾을 수 없습니다.", null));
        }
    }

    // --- [New] 보관함 문서 이름 변경 (PATCH /api/resumes/{resumeId}/title) ---
    @PatchMapping("/resumes/{resumeId}/title")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateTitle(
            Authentication authentication,
            @PathVariable Long resumeId,
            @RequestBody CoverLetterDto.TitleUpdateRequest request) {
        try {
            Long updatedId = coverLetterService.updateCoverLetterTitle(getUsername(authentication), resumeId, request.getTitle());
            
            return ResponseEntity.ok(new ApiResponse<>(200, "자기소개서 제목이 성공적으로 변경되었습니다.",
                    Map.of("resumeId", updatedId, "title", request.getTitle())));
            
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 자기소개서를 찾을 수 없습니다.", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, "제목은 1자 이상 100자 이하로 입력해주세요.", null));
        }
    }
}