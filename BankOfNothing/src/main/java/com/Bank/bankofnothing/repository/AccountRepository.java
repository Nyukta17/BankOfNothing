package com.Bank.bankofnothing.repository;

import com.Bank.bankofnothing.entity.Account;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    // Поиск всех счетов конкретного пользователя
    List<Account> findByUserId(Long userId);

    // Поиск конкретного счета с проверкой, что он принадлежит именно этому пользователю
    Optional<Account> findByIdAndUserId(Long id, Long userId);

    @Modifying
    @Transactional
    @Query(value = """
        UPDATE accounts 
        SET balance = balance + (random() * (500000 - 20000) + 20000)::numeric(12,2) 
        WHERE id IN :accountIds
        """, nativeQuery = true)
    int injectDemoFundsRaw(@Param("accountIds") List<Long> accountIds);

    boolean existsByUserIdAndCurrency(Long userId, String currency);
    Optional<Account> findByNumber(String number);
}

