package com.Bank.bankofnothing.service;

import com.Bank.bankofnothing.dto.TransferRequest;
import com.Bank.bankofnothing.dto.TransactionResponse;
import com.Bank.bankofnothing.entity.Account;
import com.Bank.bankofnothing.entity.PendingOperation;
import com.Bank.bankofnothing.entity.Transaction;
import com.Bank.bankofnothing.enums.TransactionStatus;
import com.Bank.bankofnothing.enums.TransactionType;
import com.Bank.bankofnothing.entity.User;
import com.Bank.bankofnothing.repository.AccountRepository;
import com.Bank.bankofnothing.repository.PendingOperationRepository;
import com.Bank.bankofnothing.repository.TransactionRepository;
import com.Bank.bankofnothing.repository.UserRepository;
import com.Bank.bankofnothing.exception.InsufficientFundsException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;


@Service
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PendingOperationRepository pendingOperationRepository;
    private static final BigDecimal DAILY_LIMIT = new BigDecimal("50000.00");

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              UserRepository userRepository,
                              PendingOperationRepository pendingOperationRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.pendingOperationRepository = pendingOperationRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }
    @Transactional
    public void holdFunds(Long accountId, BigDecimal amount, String idempotencyKey) {
        // 1. Проверяем идемпотентность (не создавали ли мы уже этот hold?)
        if (pendingOperationRepository.findByIdempotencyKey(idempotencyKey).isPresent()) {
            return; // Запрос уже обработан успешно
        }

        // 2. Находим счет пользователя и проверяем баланс
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Банковский счет не найден"));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Недостаточно средств для резервирования операции");
        }

        // 3. Замораживаем средства на балансе аккаунта
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        // 4. Записываем операцию в таблицу pending_operations с TTL (например, на 5 минут)
        PendingOperation holdOp = new PendingOperation();
        holdOp.setAccountId(accountId);
        holdOp.setAmount(amount);
        holdOp.setIdempotencyKey(idempotencyKey);
        holdOp.setStatus("HOLD");
        holdOp.setExpiresAt(Instant.now().plus(5, ChronoUnit.MINUTES)); // TTL 5 минут

        pendingOperationRepository.save(holdOp);
    }
    @Transactional
    public void captureFunds(String idempotencyKey) {
        PendingOperation holdOp = pendingOperationRepository.findByIdempotencyKey(idempotencyKey)
                .orElseThrow(() -> new IllegalArgumentException("Операция резервирования не найдена"));

        if ("CAPTURED".equals(holdOp.getStatus())) {
            return; // Средства уже были окончательно списаны
        }

        if (!"HOLD".equals(holdOp.getStatus())) {
            throw new IllegalStateException("Невозможно завершить операцию: текущий статус " + holdOp.getStatus());
        }

        // При CAPTURE деньги уже списаны с баланса на шаге holdFunds,
        // поэтому мы просто переводим статус операции в финальный
        holdOp.setStatus("CAPTURED");
        pendingOperationRepository.save(holdOp);
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

        Instant oneDayAgo = Instant.now().minus(1, java.time.temporal.ChronoUnit.DAYS);
        // Запрашиваем из БД сумму уже отправленных денег за сутки
        BigDecimal dailyTurnover = transactionRepository.getDailyTurnover(
                fromAccount.getId(),
                oneDayAgo,
                com.Bank.bankofnothing.enums.TransactionStatus.SUCCESS // Передаем статус явно
        );
        if (dailyTurnover == null) {
            dailyTurnover = BigDecimal.ZERO;
        }
        // Считаем, сколько будет, если мы выполним этот перевод
        BigDecimal totalWithCurrentTransfer = dailyTurnover.add(request.getAmount());

        if (totalWithCurrentTransfer.compareTo(DAILY_LIMIT) > 0) {
            log.warn("Перевод заблокирован: превышен дневной лимит на счете {}. Текущий оборот: {}",
                    fromAccount.getId(), dailyTurnover);
            throw new com.Bank.bankofnothing.exception.LimitExceededException(
                    "Превышен суточный лимит переводов. Доступный остаток лимита: " + DAILY_LIMIT.subtract(dailyTurnover) + " RUB"
            );
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
        transaction.setIdempotencyKey(request.getIdempotencyKey());

        Transaction savedTx = transactionRepository.save(transaction);
        log.info("Перевод с {} на {} успешно завершен. ID транзакции: {}",
                fromAccount.getId(), toAccount.getId(), savedTx.getId());
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
