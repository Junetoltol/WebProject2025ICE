package com.jobbuddy.backend.dto;

import java.time.LocalDateTime;

public class CoverLetterListItemResponse {

    private Long coverLetterId;
    private String title;
    private String previewUrl;
    private LocalDateTime updatedAt;

    public CoverLetterListItemResponse() {
    }

    public CoverLetterListItemResponse(Long coverLetterId,
                                       String title,
                                       String previewUrl,
                                       LocalDateTime updatedAt) {
        this.coverLetterId = coverLetterId;
        this.title = title;
        this.previewUrl = previewUrl;
        this.updatedAt = updatedAt;
    }

    public Long getCoverLetterId() { return coverLetterId; }
    public void setCoverLetterId(Long coverLetterId) { this.coverLetterId = coverLetterId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
