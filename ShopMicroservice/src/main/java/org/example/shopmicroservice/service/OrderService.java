package org.example.shopmicroservice.service;

import lombok.RequiredArgsConstructor;
import org.example.shopmicroservice.dto.*;
import org.example.shopmicroservice.entity.*;
import org.example.shopmicroservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse processOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setUserId(request.userId());
        order.setStatus("PAID"); // На 1 этапе считаем, что раз банк вызвал нас, значит списал деньги

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (ItemDto itemDto : request.items()) {
            Product product = productRepository.findById(itemDto.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Товар не найден с ID: " + itemDto.productId()));

            if (product.getStock() < itemDto.quantity()) {
                throw new IllegalStateException("Недостаточно товара на складе: " + product.getName());
            }

            // Уменьшаем количество на складе
            product.setStock(product.getStock() - itemDto.quantity());
            productRepository.save(product);

            // Считаем стоимость позиции
            BigDecimal itemPrice = product.getPrice().multiply(BigDecimal.valueOf(itemDto.quantity()));
            totalAmount = totalAmount.add(itemPrice);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.quantity());
            orderItem.setPrice(product.getPrice());
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        return new OrderResponse(savedOrder.getId(), savedOrder.getStatus(), savedOrder.getTotalAmount());
    }
}