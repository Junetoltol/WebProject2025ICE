package com.jobbuddy.backend.dto;
// 만든놈 최은준

import java.time.LocalDateTime;

public class CoverLetterListItemResponse {

    private Long coverLetterId;
    private String title;
    private String previewUrl;
    
    // 상태값 추가 (PROCESSING, SUCCESS 등)
    private String status;
    
    private LocalDateTime updatedAt;

    public CoverLetterListItemResponse() {
    }

    // 인자 5개짜리 생성자
    public CoverLetterListItemResponse(Long coverLetterId,
                                       String title,
                                       String previewUrl,
                                       String status,
                                       LocalDateTime updatedAt) {
        this.coverLetterId = coverLetterId;
        this.title = title;
        this.previewUrl = previewUrl;
        this.status = status;
        this.updatedAt = updatedAt;
    }

    public Long getCoverLetterId() { return coverLetterId; }
    public void setCoverLetterId(Long coverLetterId) { this.coverLetterId = coverLetterId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}