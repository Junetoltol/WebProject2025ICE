package com.jobbuddy.backend.model;
//만든놈 최은준

public enum CoverLetterStatus {
    PROCESSING,  // AI가 아직 생성 중
    SUCCESS,     // 생성 완료
    FAILED       // 생성 실패 (필요 없으면 나중에 안 써도 됨)
}
