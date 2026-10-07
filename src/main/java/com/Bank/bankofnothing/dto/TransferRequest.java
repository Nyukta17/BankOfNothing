package com.Bank.bankofnothing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
@Getter
@Setter
public class TransferRequest {
    @NotNull(message = "Укажите счет списания")
    private Long fromAccountId;
    @NotNull(message = "Укажите счет зачисления")
    private Long toAccountId;
    @NotNull(message = "Укажите сумму")
    @Positive(message = "Сумма перевода должна быть больше нуля")
    private BigDecimal amount;
}
