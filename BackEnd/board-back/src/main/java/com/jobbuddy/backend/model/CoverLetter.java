// src/main/java/com/jobbuddy/model/CoverLetter.java
package com.jobbuddy.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cover_letters")
public class CoverLetter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 자소서 제목
    private String title;

    // 질문 목록 (미리보기용)
    @ElementCollection
    @CollectionTable(
            name = "cover_letter_questions",
            joinColumns = @JoinColumn(name = "cover_letter_id")
    )
    @Column(name = "question")
    private List<String> questions;

    // 톤 (예: "진중함")
    private String tone;

    // 질문당 글자수 (예: 1000)
    private Integer lengthPerQuestion;

    // 생성 상태 (PROCESSING / SUCCESS / FAILED)
    @Enumerated(EnumType.STRING)
    private CoverLetterStatus status;

    // 미리보기 이미지 URL (예: /files/cover-7001.png)
    private String previewUrl;

    // 보관함에 저장됐는지
    private boolean archived;

    // 소유자 (User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User owner;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected CoverLetter() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // --- getter / setter 최소한만 ---

    public Long getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<String> getQuestions() { return questions; }
    public void setQuestions(List<String> questions) { this.questions = questions; }

    public String getTone() { return tone; }
    public void setTone(String tone) { this.tone = tone; }

    public Integer getLengthPerQuestion() { return lengthPerQuestion; }
    public void setLengthPerQuestion(Integer lengthPerQuestion) { this.lengthPerQuestion = lengthPerQuestion; }

    public CoverLetterStatus getStatus() { return status; }
    public void setStatus(CoverLetterStatus status) { this.status = status; }

    public String getPreviewUrl() { return previewUrl; }
    public void setPreviewUrl(String previewUrl) { this.previewUrl = previewUrl; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
