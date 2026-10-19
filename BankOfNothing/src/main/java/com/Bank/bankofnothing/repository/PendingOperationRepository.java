package com.Bank.bankofnothing.repository;

import com.Bank.bankofnothing.entity.PendingOperation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PendingOperationRepository extends JpaRepository<PendingOperation,Long> {
    Optional<PendingOperation> findByIdempotencyKey(String idempotencyKey);
    List<PendingOperation> findAllByStatusAndExpiresAtBefore(String status, Instant now);
}
