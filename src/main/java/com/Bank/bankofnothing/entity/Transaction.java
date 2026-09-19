package com.Bank.bankofnothing.entity;

import com.Bank.bankofnothing.enums.TransactionStatus;
import com.Bank.bankofnothing.enums.TransactionType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Table(name = "transactions")
@Entity
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id")
    private Account fromAccount;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="to_account_id")
    private Account toAccount;

    private BigDecimal amount;
    private String currency;
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    @Enumerated(EnumType.STRING)
    private TransactionStatus status;
    @Column(unique = true)
    private String idempotencyKey;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false) // Добавьте букву 'd' в "created_at"
    private Instant createdAt;
}


