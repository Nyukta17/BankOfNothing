package com.Bank.bankofnothing.dto;

import java.math.BigDecimal;

public record HoldRequest(Long accountId,
                          BigDecimal amount,
                          String idempotencyKey) {}
