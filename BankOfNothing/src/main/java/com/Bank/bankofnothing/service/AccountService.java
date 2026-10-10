package com.Bank.bankofnothing.service;

import com.Bank.bankofnothing.dto.AccountRequest;
import com.Bank.bankofnothing.dto.AccountResponse;
import com.Bank.bankofnothing.entity.Account;
import com.Bank.bankofnothing.enums.AccountStatus;
import com.Bank.bankofnothing.entity.User;
import com.Bank.bankofnothing.repository.AccountRepository;
import com.Bank.bankofnothing.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    // Хелпер-метод для получения текущего пользователя из SecurityContext
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }

    @Transactional
    public AccountResponse createAccount(AccountRequest request) {
        User currentUser = getCurrentUser();

        Account account = new Account();
        account.setUser(currentUser);
        account.setBalance(BigDecimal.ZERO); // Баланс при создании = 0
        account.setCurrency(request.getCurrency().toUpperCase());
        account.setStatus(AccountStatus.ACTIVE); // Используем наш Enum
        account.setVersion(0L); // Начальная версия для оптимистичной блокировки

        Account savedAccount = accountRepository.save(account);
        return mapToResponse(savedAccount);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getMyAccounts() {
        User currentUser = getCurrentUser();
        return accountRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountById(Long id) {
        User currentUser = getCurrentUser();
        Account account = accountRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Счет не найден или у вас нет к нему доступа"));
        return mapToResponse(account);
    }

    private AccountResponse mapToResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setBalance(account.getBalance());
        response.setCurrency(account.getCurrency());
        response.setStatus(account.getStatus().name());
        response.setCreatedAt(account.getCreatedAt());
        return response;
    }
}
