package com.Bank.bankofnothing.service;

import com.Bank.bankofnothing.dto.TransferRequest;
import com.Bank.bankofnothing.dto.TransactionResponse;
import com.Bank.bankofnothing.entity.Account;
import com.Bank.bankofnothing.entity.Transaction;
import com.Bank.bankofnothing.enums.TransactionStatus;
import com.Bank.bankofnothing.enums.TransactionType;
import com.Bank.bankofnothing.entity.User;
import com.Bank.bankofnothing.repository.AccountRepository;
import com.Bank.bankofnothing.repository.TransactionRepository;
import com.Bank.bankofnothing.repository.UserRepository;
import com.Bank.bankofnothing.exception.InsufficientFundsException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }

    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        User currentUser = getCurrentUser();

        // 1. Загружаем счета
        Account fromAccount = accountRepository.findById(request.getFromAccountId())
                .orElseThrow(() -> new RuntimeException("Счет списания не найден"));

        Account toAccount = accountRepository.findById(request.getToAccountId())
                .orElseThrow(() -> new RuntimeException("Счет зачисления не найден"));

        // 2. Проверяем, что счет списания принадлежит текущему авторизованному юзеру
        if (!fromAccount.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Вы не можете списывать деньги с чужого счета");
        }

        // 3. Проверяем равенство валют (упрощение для учебного банка)
        if (!fromAccount.getCurrency().equals(toAccount.getCurrency())) {
            throw new RuntimeException("Переводы возможны только между счетами в одинаковой валюте");
        }

        // 4. Проверяем достаточность баланса
        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException("Недостаточно средств на счете");
        }

        // 5. Выполняем перевод денег
        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));

        // Сохраняем обновленные балансы счетов (оптимистичная блокировка сработает автоматически через @Version)
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        // 6. Фиксируем транзакцию в истории
        Transaction transaction = new Transaction();
        transaction.setFromAccount(fromAccount);
        transaction.setToAccount(toAccount);
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(fromAccount.getCurrency());
        transaction.setType(TransactionType.TRANSFER);
        transaction.setStatus(TransactionStatus.SUCCESS);
        // Генерируем уникальный ключ идемпотентности, чтобы избежать дубликатов в БД
        transaction.setIdempotencyKey(UUID.randomUUID().toString());

        Transaction savedTx = transactionRepository.save(transaction);
        return mapToResponse(savedTx);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAccountHistory(Long accountId, Pageable pageable) {
        User currentUser = getCurrentUser();

        // Проверяем, что запрашиваемый счет существует и принадлежит пользователю
        Account account = accountRepository.findByIdAndUserId(accountId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Счет не найден или доступ ограничен"));

        return transactionRepository.findByFromAccountIdOrToAccountId(account.getId(), account.getId(), pageable)
                .map(this::mapToResponse);
    }

    private TransactionResponse mapToResponse(Transaction tx) {
        TransactionResponse response = new TransactionResponse();
        response.setId(tx.getId());
        response.setFromAccountId(tx.getFromAccount() != null ? tx.getFromAccount().getId() : null);
        response.setToAccountId(tx.getToAccount() != null ? tx.getToAccount().getId() : null);
        // Исправлено с учетом опечатки в названии поля сущности (createdAt)
        response.setCreatedAt(tx.getCreatedAt());
        response.setAmount(tx.getAmount());
        response.setCurrency(tx.getCurrency());
        response.setType(tx.getType().name());
        response.setStatus(tx.getStatus().name());
        return response;
    }
}
