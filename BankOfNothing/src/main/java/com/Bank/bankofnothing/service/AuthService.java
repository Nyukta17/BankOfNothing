package com.Bank.bankofnothing.service;

import com.Bank.bankofnothing.dto.LoginRequest;
import com.Bank.bankofnothing.dto.JwtResponse;
import com.Bank.bankofnothing.dto.TokenRefreshRequest;
import com.Bank.bankofnothing.entity.RefreshToken;
import com.Bank.bankofnothing.entity.User;
import com.Bank.bankofnothing.repository.RefreshTokenRepository;
import com.Bank.bankofnothing.repository.UserRepository;
import com.Bank.bankofnothing.security.JwtCore;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtCore jwtCore; // Ваш компонент генерации токенов

    public AuthService(UserRepository userRepository,RefreshTokenRepository refreshTokenRepository ,PasswordEncoder passwordEncoder, JwtCore jwtCore) {
        this.userRepository = userRepository;
        this.refreshTokenRepository=refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtCore = jwtCore;
    }
    @Transactional
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
        String accessToken = jwtCore.generateAccessToken(user.getEmail());

        // 4. Возвращаем DTO с токеном и email
        refreshTokenRepository.deleteByUserId(user.getId());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));

        refreshTokenRepository.save(refreshToken);
        return new JwtResponse(accessToken,refreshToken.getToken());
    }
    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        // При logout — каскадное удаление записи токена из БД
        refreshTokenRepository.deleteByUserId(user.getId());
    }

    @Transactional
    public JwtResponse refreshSession(TokenRefreshRequest request){
        RefreshToken tokenInDb = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(()->new RuntimeException("Невалидный Refresh токен. Войдите заново."));

        if (tokenInDb.getExpiresAt().isBefore(Instant.now())){
            refreshTokenRepository.delete(tokenInDb);
            throw new RuntimeException("Срок действия Refresh токена истек. Войдите заново.");
        }
        User user = tokenInDb.getUser();

        String newAccessToken = jwtCore.generateAccessToken(user.getEmail());

        refreshTokenRepository.delete(tokenInDb);

        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setUser(user);
        newRefreshToken.setToken(UUID.randomUUID().toString());
        newRefreshToken.setExpiresAt(Instant.now().plus(7,ChronoUnit.DAYS));
        refreshTokenRepository.save(newRefreshToken);

        return new JwtResponse(newAccessToken,newRefreshToken.getToken());
    }
}
