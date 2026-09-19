package com.Bank.bankofnothing.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.List;


@Table(name = "users")
@Entity
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String passwordHash;
    @Column(nullable = false)
    private String fullName;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false) // Добавьте букву 'd' в "created_at"
    private Instant createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false) // Было "update_at", исправлено на "updated_at"
    private Instant updatedAt;

    @OneToMany(mappedBy = "user")
    private List<Account> accounts;
    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<RefreshToken> refreshTokens;


}
