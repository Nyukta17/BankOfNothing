package org.example.shopmicroservice.dto;
import java.math.BigDecimal;

public record OrderResponse(
        Long orderId,
        String status,
        BigDecimal totalAmount
) {}
