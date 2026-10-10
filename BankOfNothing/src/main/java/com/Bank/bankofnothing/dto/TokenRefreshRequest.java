package com.Bank.bankofnothing.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenRefreshRequest {
    @NotBlank(message = "Refresh Token не должен быть пустым")
    private String refreshToken;
}
