package com.Bank.bankofnothing.controller;

import com.Bank.bankofnothing.dto.LoginRequest;
import com.Bank.bankofnothing.dto.JwtResponse;
import com.Bank.bankofnothing.dto.TokenRefreshRequest;
import com.Bank.bankofnothing.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshSession(request));
    }

    // Выход из системы (удаление сессии из БД)
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        authService.logout(currentEmail);
        return ResponseEntity.noContent().build(); // Возвращает 204 No Content
    }
}
