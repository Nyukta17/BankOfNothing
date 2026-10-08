package com.Bank.bankofnothing.repository;

import com.Bank.bankofnothing.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.Instant;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByFromAccountIdOrToAccountId(Long fromAccountId, Long toAccountId, Pageable pageable);

    // Оптимизированный запрос: передаем статус через параметр, чтобы Postgres 100% его распознал
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.fromAccount.id = :accountId " +
            "AND t.status = :status " +
            "AND t.createdAt >= :startDate")
    BigDecimal getDailyTurnover(@Param("accountId") Long accountId,
                                @Param("startDate") Instant startDate,
                                @Param("status") com.Bank.bankofnothing.enums.TransactionStatus status); // Обратите внимание на ваш пакет enums
}
