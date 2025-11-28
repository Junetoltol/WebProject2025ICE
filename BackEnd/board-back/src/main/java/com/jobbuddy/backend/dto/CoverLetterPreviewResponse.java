package com.jobbuddy.backend.dto;
// 만든놈 최은준

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class CoverLetterPreviewResponse {

    private Long coverLetterId;
    private String title;
    private List<String> questions;
    private String tone;
    private Integer lengthPerQuestion;
    private String status;
    private String previewUrl;
    
    private Map<String, Object> sections; 

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 🔹 문항별 내용
    private List<CoverLetterSectionDto> sections;

    public CoverLetterPreviewResponse() {
    }

    // 🔹 예전 코드와 호환용 생성자 (sections 없이)
    public CoverLetterPreviewResponse(
            Long coverLetterId,
            String title,
            List<String> questions,
            String tone,
            Integer lengthPerQuestion,
            String status,
            String previewUrl,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this(coverLetterId, title, questions, tone, lengthPerQuestion,
                status, previewUrl, createdAt, updatedAt, null);
    }

    // 🔹 sections까지 포함한 생성자
    public CoverLetterPreviewResponse(
            Long coverLetterId,
            String title,
            List<String> questions,
            String tone,
            Integer lengthPerQuestion,
            String status,
            String previewUrl,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<CoverLetterSectionDto> sections
    ) {
        this.coverLetterId = coverLetterId;
        this.title = title;
        this.questions = questions;
        this.tone = tone;
        this.lengthPerQuestion = lengthPerQuestion;
        this.status = status;
        this.previewUrl = previewUrl;
        this.sections = sections;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.sections = sections;
    }

    // Getter/Setter
    public Long getCoverLetterId() { return coverLetterId; }
    public void setCoverLetterId(Long coverLetterId) { this.coverLetterId = coverLetterId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<String> getQuestions() { return questions; }
    public void setQuestions(List<String> questions) { this.questions = questions; }

    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }

    public Integer getLengthPerQuestion() { return lengthPerQuestion; }
    public void setLengthPerQuestion(Integer lengthPerQuestion) { this.lengthPerQuestion = lengthPerQuestion; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }

    public Map<String, Object> getSections() { return sections; }
    public void setSections(Map<String, Object> sections) { this.sections = sections; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<CoverLetterSectionDto> getSections() {
        return sections;
    }

    public void setSections(List<CoverLetterSectionDto> sections) {
        this.sections = sections;
    }
}
