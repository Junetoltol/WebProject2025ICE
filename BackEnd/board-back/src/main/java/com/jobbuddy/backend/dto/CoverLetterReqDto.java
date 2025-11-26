package com.jobbuddy.backend.dto;

import java.util.Map;
import java.util.List;

public class CoverLetterReqDto {

    // 1. 자소서 저장/수정 요청 (POST, PATCH)
    public static class SaveRequest {
        private String title;
        private String targetCompany;
        private String targetJob;
        private Map<String, Object> sections; // 유연한 JSON 구조 처리

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getTargetCompany() { return targetCompany; }
        public void setTargetCompany(String targetCompany) { this.targetCompany = targetCompany; }
        public String getTargetJob() { return targetJob; }
        public void setTargetJob(String targetJob) { this.targetJob = targetJob; }
        public Map<String, Object> getSections() { return sections; }
        public void setSections(Map<String, Object> sections) { this.sections = sections; }
    }

    // 2. 자소서 생성 요청 (POST /generate)
    public static class GenerateRequest {
        private String exportFormat;
        private Map<String, Object> options;

        public String getExportFormat() { return exportFormat; }
        public void setExportFormat(String exportFormat) { this.exportFormat = exportFormat; }
        public Map<String, Object> getOptions() { return options; }
        public void setOptions(Map<String, Object> options) { this.options = options; }
    }

    // 3. 자소서 제목 변경 요청 (PATCH /api/resumes/{id}/title)
    public static class UpdateTitleRequest {
        private String title;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }
    
    // 4. 저장/수정/제목변경 성공 시 ID 반환용
    public static class IdResponse {
        private Long coverLetterId;
        // 제목 변경 시 필요할 수 있는 필드 추가
        private String title; 
        
        public IdResponse(Long coverLetterId) {
            this.coverLetterId = coverLetterId;
        }
        
        public IdResponse(Long coverLetterId, String title) {
            this.coverLetterId = coverLetterId;
            this.title = title;
        }

        public Long getCoverLetterId() { return coverLetterId; } // 명세서에는 resumeId로 나오지만 값은 동일
        public Long getResumeId() { return coverLetterId; }      // 명세서 대응
        public String getTitle() { return title; }
    }
}