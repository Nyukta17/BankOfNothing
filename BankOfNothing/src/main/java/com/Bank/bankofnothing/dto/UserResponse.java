package com.Bank.bankofnothing.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private Instant createdAt;
}
