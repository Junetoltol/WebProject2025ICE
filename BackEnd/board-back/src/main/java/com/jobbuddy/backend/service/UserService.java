package com.jobbuddy.backend.service;

import com.jobbuddy.backend.model.User;
import com.jobbuddy.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;



import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*()_+=\\-]).{8,}$");

    public void signup(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent())
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        if (!PASSWORD_PATTERN.matcher(user.getPassword()).matches())
            throw new IllegalArgumentException("비밀번호 형식이 올바르지 않습니다.");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public boolean login(String username, String rawPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.isPresent() && passwordEncoder.matches(rawPassword, userOpt.get().getPassword());
    }

    public boolean isUsernameAvailable(String username) {
        return userRepository.findByUsername(username).isEmpty();
    }

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

    public void changePassword(String username, String currentPassword, String newPassword, String confirmPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        User user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            throw new SecurityException("비밀번호가 틀렸습니다.");
        if (!newPassword.equals(confirmPassword))
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        if (!PASSWORD_PATTERN.matcher(newPassword).matches())
            throw new IllegalArgumentException("새 비밀번호 형식이 올바르지 않습니다.");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}

