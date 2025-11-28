package com.jobbuddy.backend.dto;

// 만든놈 최은준

public class CoverLetterSectionDto {

    private String question;
    private String answer;

    public CoverLetterSectionDto() {
    }

    public CoverLetterSectionDto(String question, String answer) {
        this.question = question;
        this.answer = answer;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
