package com.Bank.bankofnothing.service;

import com.Bank.bankofnothing.dto.LoginRequest;
import com.Bank.bankofnothing.dto.JwtResponse;
import com.Bank.bankofnothing.entity.User;
import com.Bank.bankofnothing.repository.UserRepository;
import com.Bank.bankofnothing.security.JwtCore;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtCore jwtCore; // Ваш компонент генерации токенов

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtCore jwtCore) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtCore = jwtCore;
    }

    public JwtResponse login(LoginRequest request) {
        // 1. Ищем пользователя по email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Неверный email или пароль"));

        // 2. Проверяем, совпадает ли пароль с хэшем из БД
        // matches(чистый_пароль, хэш_из_бд)
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Неверный email или пароль");
        }

        // 3. Если всё ок — генерируем токен
        String token = jwtCore.generateToken(user.getEmail());

        // 4. Возвращаем DTO с токеном и email
        return new JwtResponse(token, user.getEmail());
    }
}
