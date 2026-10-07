package com.Bank.bankofnothing.repository;

import com.Bank.bankofnothing.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    // Поиск всех счетов конкретного пользователя
    List<Account> findByUserId(Long userId);

    // Поиск конкретного счета с проверкой, что он принадлежит именно этому пользователю
    Optional<Account> findByIdAndUserId(Long id, Long userId);
}
