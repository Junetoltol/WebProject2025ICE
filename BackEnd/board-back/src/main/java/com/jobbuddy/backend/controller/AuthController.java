package com.jobbuddy.backend.controller;

import com.jobbuddy.backend.dto.ApiResponse;
import com.jobbuddy.backend.dto.AuthDto;
import com.jobbuddy.backend.model.User;
import com.jobbuddy.backend.service.UserService;
import com.jobbuddy.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@RequestBody User user) {
        try {
            userService.signup(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(201, "회원가입이 성공적으로 완료되었습니다.", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    // 로그인
    @PostMapping("/login")
   public ResponseEntity<ApiResponse<AuthDto.LoginResponse>> login(@RequestBody AuthDto.LoginRequest request) {
        boolean success = userService.login(request.getUsername(), request.getPassword());
        if (success) {
            String token = jwtUtil.generateToken(request.getUsername());
            return ResponseEntity.ok(new ApiResponse<>(200, "로그인에 성공했습니다.",
                    new AuthDto.LoginResponse("Bearer", token)));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "아이디 또는 비밀번호가 일치하지 않습니다.", null));
        }
    }

    // ID 중복 체크
    @GetMapping("/id")
    public ResponseEntity<ApiResponse<Void>> checkId(@RequestParam String username) {
        boolean available = userService.isUsernameAvailable(username);
        if (available)
            return ResponseEntity.ok(new ApiResponse<>(200, "사용 가능한 아이디입니다.", null));
        else
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse<>(409, "이미 사용 중인 아이디입니다.", null));
    }

    // 개인정보 수정 (JWT 필요)
    @PatchMapping("/users/me/profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(Authentication authentication,
                                                           @RequestBody AuthDto.ProfileRequest request) {
        String username = (String) authentication.getPrincipal();
        boolean success = userService.updateProfile(username, request.getName(), request.getUniv(), request.getMajor());
        if (success)
            return ResponseEntity.ok(new ApiResponse<>(200, "이력 정보가 성공적으로 저장되었습니다.", null));
        else
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, "사용자를 찾을 수 없습니다.", null));
    }

    // 비밀번호 변경 (JWT 필요)
    @PatchMapping("/users/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication authentication,
                                                            @RequestBody AuthDto.PasswordRequest request) {
        String username = (String) authentication.getPrincipal();
        try {
            userService.changePassword(username, request.getCurrentPassword(), request.getNewPassword(), request.getConfirmPassword());
            return ResponseEntity.ok(new ApiResponse<>(200, "비밀번호가 성공적으로 변경되었습니다.", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, e.getMessage(), null));
        }
    }

    // 내 정보 조회 (JWT 필요)
    @GetMapping("/users/me")
    public ResponseEntity<ApiResponse<User>> getMe(Authentication authentication) {
        String username = (String) authentication.getPrincipal();
        User user = userService.getUserByUsername(username);
        if (user != null)
            return ResponseEntity.ok(new ApiResponse<>(200, "회원 정보를 조회했습니다.", user));
        else
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, "사용자를 찾을 수 없습니다.", null));
    }

    //테스트. 지울꺼.@GetMapping("

    @GetMapping("/ping")
    public String ping() {
        return "pong";
}
    
}
