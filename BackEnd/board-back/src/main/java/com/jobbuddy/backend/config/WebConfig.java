package com.jobbuddy.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000") //프론트 주소 허용(개발용)
                .allowedMethods("*") //HTTP 메서드 전체 허용
                .allowedHeaders("*") //모든 헤더 허용
                .allowCredentials(true) //쿠키, Authorization 헤더 허용
                .maxAge(3600);
    }
}
