package com.Bank.bankofnothing.entity;

import com.Bank.bankofnothing.enums.AccountStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Table(name = "accounts", uniqueConstraints = @UniqueConstraint(name = "uk_accounts_user_currency", columnNames = {"user_id", "currency"}))
@Entity
@Getter
@Setter
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false,unique = true, length = 20)
    private String number;

    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal balance;

    @Column(length = 3,nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;

    @Version
    @Column(nullable = false)
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at",nullable = false,updatable = false)
    private Instant createdAt;
}
