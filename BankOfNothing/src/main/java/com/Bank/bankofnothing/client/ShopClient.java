package com.Bank.bankofnothing.client;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ShopClient {

    private final RestClient shopRestClient;

    // Описываем рекорды-DTO прямо внутри или выносим в отдельный пакет dto монолита
    public record ItemDto(Long productId, Integer quantity) {}
    public record CreateOrderRequest(Long userId, List<ItemDto> items) {}
    public record OrderResponse(Long orderId, String status, BigDecimal totalAmount) {}

    public OrderResponse sendOrderToShop(Long userId, List<ItemDto> items) {
        CreateOrderRequest request = new CreateOrderRequest(userId, items);

        return shopRestClient.post()
                .uri("/api/v1/shop/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(OrderResponse.class);
    }
}