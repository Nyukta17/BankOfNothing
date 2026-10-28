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
    public OrderResponse buyFromShop(Long userId, BigDecimal amount, String currency, List<ItemDto> items) {
        // 1. Получаем ВСЕ счета пользователя
        List<Account> accounts = accountRepository.findByUserId(userId);

        // 2. Ищем счет именно в той валюте, которую требует магазин
        Account account = accounts.stream()
                .filter(acc -> acc.getCurrency().equalsIgnoreCase(currency)) // Ищем точное совпадение (например, "USD")
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Счет в валюте " + currency + " не найден"));

        // 3. Списываем деньги
        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Недостаточно средств на счете в валюте " + currency);
        }
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        // 4. Вызываем микросервис магазина
        return shopClient.sendOrderToShop(userId, items);
    }
}