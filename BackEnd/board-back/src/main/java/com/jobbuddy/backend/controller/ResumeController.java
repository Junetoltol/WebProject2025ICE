package com.jobbuddy.backend.controller;

import com.jobbuddy.backend.dto.ApiResponse;
import com.jobbuddy.backend.dto.CoverLetterReqDto;
import com.jobbuddy.backend.service.CoverLetterService;
import com.jobbuddy.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/resumes") // CoverLetterController 주소는 /api/cover-letters고, 자소서 이름 변경/삭제/템플릿 선택 기능은 명세서 상에서 주소가 /api/resume여서 컨트롤러 파일 분리함.
public class ResumeController {

    private final CoverLetterService coverLetterService;
    private final UserService userService;

    public ResumeController(CoverLetterService coverLetterService, UserService userService) {
        this.coverLetterService = coverLetterService;
        this.userService = userService;
    }

    // 1. 템플릿 선택 API (PUT /api/resumes/{resumeId}/template)
    @PutMapping("/{resumeId}/template")
    public ResponseEntity<ApiResponse<CoverLetterReqDto.IdResponse>> selectTemplate(
            @PathVariable Long resumeId,
            @RequestBody Map<String, String> requestBody, // {"templateId": "..."}
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
            String templateId = requestBody.get("templateId");
            
            coverLetterService.updateTemplate(userId, resumeId, templateId);
            
            return ResponseEntity.ok(new ApiResponse<>(200, "템플릿이 적용되었습니다.", 
                    new CoverLetterReqDto.IdResponse(resumeId)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "Resume not found.", null));
        }
    }

    // 2. 보관함 속 문서 삭제 (DELETE /api/resumes/{resumeId})
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @PathVariable Long resumeId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
            coverLetterService.deleteCoverLetter(userId, resumeId);
            
            return ResponseEntity.ok(new ApiResponse<>(200, "자기소개서가 성공적으로 삭제되었습니다.", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 자기소개서를 찾을 수 없습니다.", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, "서버 내부 오류가 발생했습니다.", null));
        }
    }

    // 3. 보관함 속 문서 이름 변경 (PATCH /api/resumes/{resumeId}/title)
    @PatchMapping("/{resumeId}/title")
    public ResponseEntity<ApiResponse<CoverLetterReqDto.IdResponse>> updateResumeTitle(
            @PathVariable Long resumeId,
            @RequestBody CoverLetterReqDto.UpdateTitleRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            if (request.getTitle() == null || request.getTitle().isEmpty() || request.getTitle().length() > 100) {
                 return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, "제목은 1자 이상 100자 이하로 입력해주세요.", null));
            }

            Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
            coverLetterService.updateTitle(userId, resumeId, request.getTitle());

            return ResponseEntity.ok(new ApiResponse<>(200, "자기소개서 제목이 성공적으로 변경되었습니다.", 
                    new CoverLetterReqDto.IdResponse(resumeId, request.getTitle())));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "해당 자기소개서를 찾을 수 없습니다.", null));
        }
    }
}