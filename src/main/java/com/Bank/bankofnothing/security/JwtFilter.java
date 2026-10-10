package com.Bank.bankofnothing.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtCore jwtCore; // Используем ваш сервис/компонент для JWT

    public JwtFilter(JwtCore jwtCore) {
        this.jwtCore = jwtCore;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // 1. Извлекаем заголовок Authorization
            String authHeader = request.getHeader("Authorization");
            String username = null;
            String jwt = null;

            // 2. Проверяем, что заголовок есть и начинается с "Bearer "
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7); // Отрезаем "Bearer " и получаем чистый токен
                if (jwtCore.validateToken(jwt)) {
                    username = jwtCore.getUsernameFromToken(jwt); // Извлекаем email из токена
                }
            }

            // 3. Если токен валиден и пользователь еще не авторизован в текущем контексте Spring
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Создаем минимальный объект UserDetails (в будущем свяжем с вашей БД)
                UserDetails userDetails = new User(username, "", Collections.emptyList());

                // Формируем объект аутентификации Spring Security
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Кладем пользователя в SecurityContext — теперь Спринг знает, кто делает запрос!
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Если токен «битый» или просрочен — просто не авторизуем пользователя (Спринг вернет 401)
            logger.error("Не удалось настроить аутентификацию пользователя", e);
        }

        // Передаем запрос дальше по цепочке фильтров
        filterChain.doFilter(request, response);
    }
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs");
    }
}
