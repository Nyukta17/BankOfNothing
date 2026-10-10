package com.Bank.bankofnothing.security;

import jakarta.servlet.*;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.UUID;

@Component
public class MdcFilter implements Filter {

    private static final String TRACE_ID_KEY = "traceId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        // Генерируем случайный уникальный ID для каждого входящего HTTP-запроса
        String traceId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put(TRACE_ID_KEY, traceId);

        try {
            chain.doFilter(request, response);
        } finally {
            // Обязательно очищаем контекст после завершения запроса
            MDC.remove(TRACE_ID_KEY);
        }
    }
}
