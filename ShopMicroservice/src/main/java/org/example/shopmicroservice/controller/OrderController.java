package org.example.shopmicroservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.shopmicroservice.dto.*;
import org.example.shopmicroservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shop/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.processOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}