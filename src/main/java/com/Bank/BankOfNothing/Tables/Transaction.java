package com.Bank.BankOfNothing.Tables;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

import static jakarta.persistence.FetchType.LAZY;

@Table(name = "transaction")
@Entity
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
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
    private String type;
    @Enumerated(EnumType.STRING)
    private String status;
    @Column(unique = true)
    private String idempotencyKey;
    @CreationTimestamp
    private Instant createAt;
}


