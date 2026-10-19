package com.Bank.bankofnothing.service;

import com.Bank.bankofnothing.entity.Account;
import com.Bank.bankofnothing.entity.PendingOperation;
import com.Bank.bankofnothing.repository.AccountRepository;
import com.Bank.bankofnothing.repository.PendingOperationRepository;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CompensatingScheduler {

    private final PendingOperationRepository pendingOperationRepository;
    private final AccountRepository accountRepository;

    // Запускаем проверку каждую минуту (60000 миллисекунд)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void releaseExpiredHolds() {
        Instant now = Instant.now();

        // 1. Ищем все операции в статусе HOLD, у которых expiresAt меньше текущего времени
        List<PendingOperation> expiredOperations =
                pendingOperationRepository.findAllByStatusAndExpiresAtBefore("HOLD", now);

        if (expiredOperations.isEmpty()) {
            return;
        }

        log.info("Обнаружено {} просроченных холдов для разморозки", expiredOperations.size());

        for (PendingOperation operation : expiredOperations) {
            try {
                // 2. Находим счет пользователя
                Account account = accountRepository.findById(operation.getAccountId())
                        .orElseThrow(() -> new IllegalArgumentException("Счет не найден для ID: " + operation.getAccountId()));

                // 3. Возвращаем замороженные деньги обратно на баланс (Компенсация!)
                account.setBalance(account.getBalance().add(operation.getAmount()));
                accountRepository.save(account);

                // 4. Переводим операцию в финальный статус RELEASED
                operation.setStatus("RELEASED");
                pendingOperationRepository.save(operation);

                log.info("Успешно разморожено {} единиц для операции {}", operation.getAmount(), operation.getIdempotencyKey());

            } catch (Exception e) {
                log.error("Ошибка при компенсации операции {}: {}", operation.getIdempotencyKey(), e.getMessage());
                // В продакшене здесь стоило бы отправить уведомление в систему мониторинга
            }
        }
    }
}
