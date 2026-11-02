package com.Bank.bankofnothing.service;

import com.Bank.bankofnothing.dto.AccountRequest;
import com.Bank.bankofnothing.dto.AccountResponse;
import com.Bank.bankofnothing.entity.Account;
import com.Bank.bankofnothing.enums.AccountStatus;
import com.Bank.bankofnothing.entity.User;
import com.Bank.bankofnothing.repository.AccountRepository;
import com.Bank.bankofnothing.repository.UserRepository;
import com.Bank.bankofnothing.security.AccountNumberGenerator;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountNumberGenerator accountNumberGenerator;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository, AccountNumberGenerator accountNumberGenerator) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountNumberGenerator = accountNumberGenerator;
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
        String currency = request.getCurrency().toUpperCase();

        if (accountRepository.existsByUserIdAndCurrency(currentUser.getId(), currency)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Счёт в этой валюте уже существует");
        }

        Account account = new Account();
        account.setUser(currentUser);
        account.setNumber(accountNumberGenerator.generate());
        account.setBalance(BigDecimal.ZERO);
        account.setCurrency(currency);
        account.setStatus(AccountStatus.ACTIVE);

        try {
            return mapToResponse(accountRepository.save(account));
        } catch (DataIntegrityViolationException e) {
            String msg = e.getMostSpecificCause().getMessage();
            if (msg != null && msg.contains("uk_accounts_user_currency")) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Счёт в этой валюте уже существует");
            }
            throw e;
        }
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
