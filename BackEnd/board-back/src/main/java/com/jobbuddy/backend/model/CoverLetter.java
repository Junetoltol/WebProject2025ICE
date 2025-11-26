package com.jobbuddy.backend.model;
//만든놈 최은준

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    // ----------------- 자소서 추가 필드 -----------------

    // 지원 회사명
    private String targetCompany;

    // 지원 직무
    private String targetJob;

    // 템플릿 ID (명세서 2번 기능 대응)
    private String templateId;

    // 상세 섹션 정보 (JSON 타입)
    // build.gradle에 hibernate-core 의존성이 있으므로 사용 가능
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private Map<String, Object> sections;

    // ----------------- 생성자 & 콜백 -----------------

    // JPA 기본 생성자 (서비스에서도 사용하니까 public)
    public CoverLetter() {
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

    // ----------------- Getter / Setter -----------------

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

    public String getTargetCompany() { return targetCompany; }
    public String getTargetJob() { return targetJob; }
    public String getTemplateId() { return templateId; }
    public Map<String, Object> getSections() { return sections; }

    // ----------------- 비즈니스 로직 메서드 -----------------

    // 정보 업데이트 (저장/수정)
    public void updateContent(String title,
                              String targetCompany,
                              String targetJob,
                              Map<String, Object> sections) {
        this.title = title;
        this.targetCompany = targetCompany;
        this.targetJob = targetJob;
        this.sections = sections;
        this.onUpdate(); // 시간 갱신
    }

    // 제목만 변경 (이름 변경 API용)
    public void updateTitle(String title) {
        this.title = title;
        this.onUpdate();
    }

    // 템플릿 ID 변경
    public void updateTemplate(String templateId) {
        this.templateId = templateId;
        this.onUpdate();
    }

    // 생성 완료 처리
    public void completeGeneration(String previewUrl) {
        this.status = CoverLetterStatus.SUCCESS;
        this.previewUrl = previewUrl;
        this.onUpdate();
    }

    // 상태 변경 (생성 시작 시)
    public void startProcessing() {
        this.status = CoverLetterStatus.PROCESSING;
        this.onUpdate();
    }
}
