package com.jobbuddy.controller;

import com.jobbuddy.model.User;
import com.jobbuddy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    // 회원가입
    @PostMapping("/signup")
    public String signup(@RequestBody User user) {
        userService.signup(user);
        return "{\"code\":201,\"message\":\"회원가입이 성공적으로 완료되었습니다.\"}";
    }

    // 로그인
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        boolean success = userService.login(request.getUsername(), request.getPassword());
        if (success) {
            return "{\"code\":200,\"message\":\"로그인에 성공했습니다.\"}";
        } else {
            return "{\"code\":401,\"message\":\"아이디 또는 비밀번호가 일치하지 않습니다.\"}";
        }
    }

    // 개인정보 수정
    @PatchMapping("/me/profile")
    public String updateProfile(@RequestBody ProfileRequest request) {
        boolean success = userService.updateProfile(request.getUsername(), request.getName(), request.getUniv(), request.getMajor());
        if (success) {
            return "{\"code\":200,\"message\":\"이력 정보가 성공적으로 저장되었습니다.\"}";
        } else {
            return "{\"code\":400,\"message\":\"사용자를 찾을 수 없습니다.\"}";
        }
    }

    // 비밀번호 변경
    @PatchMapping("/me/password")
    public String changePassword(@RequestBody PasswordRequest request) {
        boolean success = userService.changePassword(request.getUsername(), request.getCurrentPassword(), request.getNewPassword(), request.getConfirmPassword());
        if (success) {
            return "{\"code\":200,\"message\":\"비밀번호가 성공적으로 변경되었습니다.\"}";
        } else {
            return "{\"code\":401,\"message\":\"비밀번호가 일치하지 않습니다.\"}";
        }
    }

    // DTO
    static class LoginRequest {
        private String username;
        private String password;
        // getter/setter
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    static class ProfileRequest {
        private String username; // 고정값
        private String name;
        private String univ;
        private String major;
        // getter/setter
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getUniv() { return univ; }
        public void setUniv(String univ) { this.univ = univ; }
        public String getMajor() { return major; }
        public void setMajor(String major) { this.major = major; }
    }

    static class PasswordRequest {
        private String username; // 고정값
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;
        // getter/setter
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    }
}