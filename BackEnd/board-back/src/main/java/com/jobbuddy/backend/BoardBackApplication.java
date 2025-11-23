/* 
package com.jobbuddy.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(
        scanBasePackages = {
                "com.webproject.board_back", // 원래 보드 프로젝트
                "com.jobbuddy.backend"       // ✅ JobBuddy 쪽 전부 스캔
        }
)
@EnableJpaRepositories(basePackages = "com.jobbuddy.backend.repository")
@EntityScan(basePackages = "com.jobbuddy.backend.model")
public class BoardBackApplication {

    public static void main(String[] args) {
        SpringApplication.run(BoardBackApplication.class, args);
    }
}*/