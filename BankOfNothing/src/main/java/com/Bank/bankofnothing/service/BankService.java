package com.Bank.bankofnothing.service;

import com.Bank.bankofnothing.entity.Account;
import com.Bank.bankofnothing.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.Bank.bankofnothing.client.ShopClient;
import com.Bank.bankofnothing.client.ShopClient.ItemDto;
import com.Bank.bankofnothing.client.ShopClient.OrderResponse;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BankService {

    private final AccountRepository accountRepository; // Твой репозиторий счетов банка
    private final ShopClient shopClient;

    @Transactional
    public OrderResponse buyFromShop(Long userId, BigDecimal amount, List<ItemDto> items) {
        // 1. Находим счет пользователя внутри монолита
        Account account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Счет не найден"));

        // 2. Списываем деньги
        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Недостаточно средств на банковском счете");
        }
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        // Транзакция банка еще НЕ зафиксирована в БД (commit не произошел),
        // но мы уже делаем сетевой запрос наружу!

        // 3. Вызываем микросервис магазина по синхронному REST
        OrderResponse response = shopClient.sendOrderToShop(userId, items);


        return response;
    }
}