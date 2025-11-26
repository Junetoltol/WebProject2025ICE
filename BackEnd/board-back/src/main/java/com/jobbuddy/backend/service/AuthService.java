package com.jobbuddy.backend.service;

import com.jobbuddy.backend.dto.LoginRequest;
import com.jobbuddy.backend.model.User;
import com.jobbuddy.backend.repository.UserRepository;
import com.jobbuddy.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ✅ 로그인 + JWT 토큰 발급
    public String login(LoginRequest request) {

        // 1) username으로 유저 찾기
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        // 2) 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        // 3) ✅ username을 넣어서 토큰 생성
        return jwtUtil.generateToken(user.getUsername());
    }
}
