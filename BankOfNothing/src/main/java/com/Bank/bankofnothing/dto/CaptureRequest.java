package com.Bank.bankofnothing.dto;

public record CaptureRequest(String idempotencyKey) {};