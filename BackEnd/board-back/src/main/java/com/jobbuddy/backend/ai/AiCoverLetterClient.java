package com.jobbuddy.backend.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.List;

@Component
public class AiCoverLetterClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public AiCoverLetterClient(
            RestTemplateBuilder builder,
            @Value("${ai.base-url:http://localhost:8000}") String baseUrl
    ) {
        this.restTemplate = builder.build();
        this.baseUrl = baseUrl;
    }

    public AiCoverLetterResponse generate(AiCoverLetterRequest request) {
        String url = baseUrl + "/api/coverletter/generate";
        ResponseEntity<AiCoverLetterResponse> res =
                restTemplate.postForEntity(url, request, AiCoverLetterResponse.class);

        System.out.println("=== [AI CLIENT] status = " + res.getStatusCode());
        System.out.println("=== [AI CLIENT] body   = " + res.getBody());

        return res.getBody();
    }

    // ===== 요청/응답 DTO =====

    // FastAPI 쪽 CoverLetterRequest 에 맞춘 형태
    public static class AiCoverLetterRequest {
        private ResumeData data;
        private EssayConfig essay;

        public ResumeData getData() { return data; }
        public void setData(ResumeData data) { this.data = data; }

        public EssayConfig getEssay() { return essay; }
        public void setEssay(EssayConfig essay) { this.essay = essay; }
    }

    // sections(JSON) 그대로 들고 가는 용도
    public static class ResumeData {
        // 그냥 Map 으로 받아서 그대로 던진다 (Pydantic ResumeInput 구조와 맞춰서 저장해뒀다고 가정)
        private Map<String, Object> profile;
        private List<Map<String, Object>> experiences;
        private List<Map<String, Object>> projects;
        private List<Map<String, Object>> activities;
        private List<Map<String, Object>> awards;
        private List<String> skills;

        public Map<String, Object> getProfile() { return profile; }
        public void setProfile(Map<String, Object> profile) { this.profile = profile; }

        public List<Map<String, Object>> getExperiences() { return experiences; }
        public void setExperiences(List<Map<String, Object>> experiences) { this.experiences = experiences; }

        public List<Map<String, Object>> getProjects() { return projects; }
        public void setProjects(List<Map<String, Object>> projects) { this.projects = projects; }

        public List<Map<String, Object>> getActivities() { return activities; }
        public void setActivities(List<Map<String, Object>> activities) { this.activities = activities; }

        public List<Map<String, Object>> getAwards() { return awards; }
        public void setAwards(List<Map<String, Object>> awards) { this.awards = awards; }

        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
    }

    public static class EssayConfig {
        private String question;
        private String tone;
        private Integer length;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }

        public String getTone() { return tone; }
        public void setTone(String tone) { this.tone = tone; }

        public Integer getLength() { return length; }
        public void setLength(Integer length) { this.length = length; }
    }

    // FastAPI 쪽 CoverLetterResponse
    public static class AiCoverLetterResponse {

        // JSON: { "cover_letter": "..." } 와 매핑
        @JsonProperty("cover_letter")
        private String coverLetter;

        public String getCoverLetter() {
            return coverLetter;
        }

        public void setCoverLetter(String coverLetter) {
            this.coverLetter = coverLetter;
        }

        @Override
        public String toString() {
            return "AiCoverLetterResponse{coverLetter='" + coverLetter + "'}";
        }
    }
}
