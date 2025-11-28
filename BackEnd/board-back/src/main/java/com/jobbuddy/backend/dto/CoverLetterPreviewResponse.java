package com.jobbuddy.backend.dto;
//만든놈 최은준

import java.time.LocalDateTime;
import java.util.List;

public class CoverLetterPreviewResponse {

    private Long coverLetterId;
    private String title;
    private List<String> questions;
    private String tone;
    private Integer lengthPerQuestion;
    private String status; // "SUCCESS" 같은 문자열
    private String previewUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CoverLetterPreviewResponse() {
    }

    public CoverLetterPreviewResponse(Long coverLetterId,
            String title,
            List<String> questions,
            String tone,
            Integer lengthPerQuestion,
            String status,
            String previewUrl,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.coverLetterId = coverLetterId;
        this.title = title;
        this.questions = questions;
        this.tone = tone;
        this.lengthPerQuestion = lengthPerQuestion;
        this.status = status;
        this.previewUrl = previewUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getCoverLetterId() {
        return coverLetterId;
    }

    public void setCoverLetterId(Long coverLetterId) {
        this.coverLetterId = coverLetterId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPreviewUrl() {
        return previewUrl;
    }

    public void setPreviewUrl(String previewUrl) {
        this.previewUrl = previewUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}