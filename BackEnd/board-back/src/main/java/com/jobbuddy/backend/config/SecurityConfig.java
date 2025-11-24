package com.jobbuddy.backend.config;
//수정한놈 최은준

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // CSRF: REST API라 비활성화
            .csrf(csrf -> csrf.disable())

            // 세션 대신 JWT 사용 → STATELESS
            .sessionManagement(sm ->
                    sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // URL별 권한 설정
            .authorizeHttpRequests(auth -> auth
                    // 인증 없이 접근 가능한 API
                    .requestMatchers(
                            "/api/auth/signup",
                            "/api/auth/login",
                            "/api/auth/id"
                    ).permitAll()

                    // 나머지는 토큰 필수
                    .anyRequest().authenticated()
            )

            // UsernamePasswordAuthenticationFilter 전에 JWT 필터 실행
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
