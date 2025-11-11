package com.jobbuddy.dto;

public class AuthDto {

    public static class LoginRequest {
        private String username;
        private String password;
        // getter/setter
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        private String grantType;
        private String accessToken;
        public LoginResponse(String grantType, String accessToken) {
            this.grantType = grantType;
            this.accessToken = accessToken;
        }
        public String getGrantType() { return grantType; }
        public String getAccessToken() { return accessToken; }
    }

    public static class ProfileRequest {
        private String name;
        private String univ;
        private String major;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getUniv() { return univ; }
        public void setUniv(String univ) { this.univ = univ; }
        public String getMajor() { return major; }
        public void setMajor(String major) { this.major = major; }
    }

    public static class PasswordRequest {
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    }
}
