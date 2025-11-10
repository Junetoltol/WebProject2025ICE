package com.jobbuddy.service;

import com.jobbuddy.model.User;
import com.jobbuddy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 회원가입
    public void signup(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    // 로그인
    public boolean login(String username, String rawPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.isPresent() && passwordEncoder.matches(rawPassword, userOpt.get().getPassword());
    }

    // 개인정보 수정
    public boolean updateProfile(String username, String name, String univ, String major) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        user.setName(name);
        user.setUniv(univ);
        user.setMajor(major);
        userRepository.save(user);
        return true;
    }

    // 비밀번호 변경
    public boolean changePassword(String username, String currentPassword, String newPassword, String confirmPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) return false;
        if (!newPassword.equals(confirmPassword)) return false;

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }
}
