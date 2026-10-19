package org.example.shopmicroservice.service;

import lombok.RequiredArgsConstructor;
import org.example.shopmicroservice.client.BankClient;
import org.example.shopmicroservice.dto.*;
import org.example.shopmicroservice.entity.Order;
import org.example.shopmicroservice.entity.OrderItem;
import org.example.shopmicroservice.entity.Product;
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
    private final BankClient bankClient;

    @Transactional
    public OrderResponse processOrder(CreateOrderRequest request) {
        // 1. Создаем заказ в предварительном статусе PENDING
        Order order = new Order();
        order.setUserId(request.userId());
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (ItemDto itemDto : request.items()) {
            Product product = productRepository.findById(itemDto.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Товар не найден с ID: " + itemDto.productId()));

            if (product.getStock() < itemDto.quantity()) {
                throw new IllegalStateException("Недостаточно товара на складе: " + product.getName());
            }

            product.setStock(product.getStock() - itemDto.quantity());
            productRepository.save(product);

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

        // Сохраняем в БД, чтобы получить сгенерированный ID заказа
        Order savedOrder = orderRepository.save(order);

        // Формируем уникальный ключ идемпотентности для банка на основе ID заказа
        String idempotencyKey = "shop-order-" + savedOrder.getId();

        try {
            // 2. Фаза 1: Замораживаем деньги на счете пользователя в банке
            // Для упрощения передаем userId как accountId
            bankClient.holdFunds(request.userId(), totalAmount, idempotencyKey);

            // 3. Фаза 2: Если холд успешен, подтверждаем списание и обновляем статус заказа
            bankClient.captureFunds(idempotencyKey);

            savedOrder.setStatus("PAID");
            orderRepository.save(savedOrder);

        } catch (Exception e) {
            // КОМПЕНСАЦИЯ: Если банк отказал (например, нет денег), откатываем изменения локально
            savedOrder.setStatus("FAILED");
            orderRepository.save(savedOrder);

            // Возвращаем товар обратно на склад
            for (OrderItem item : savedOrder.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
            throw new IllegalStateException("Не удалось провести оплату через банк: " + e.getMessage(), e);
        }

        return new OrderResponse(savedOrder.getId(), savedOrder.getStatus(), savedOrder.getTotalAmount());
    }
}
