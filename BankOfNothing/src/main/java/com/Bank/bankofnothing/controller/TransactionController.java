package com.Bank.bankofnothing.controller;

import com.Bank.bankofnothing.dto.CaptureRequest;
import com.Bank.bankofnothing.dto.HoldRequest;
import com.Bank.bankofnothing.dto.TransferRequest;
import com.Bank.bankofnothing.dto.TransactionResponse;
import com.Bank.bankofnothing.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;




@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }
    @PostMapping("/hold")
    public ResponseEntity<Void> hold(@RequestBody HoldRequest request) {
        transactionService.holdFunds(request.accountId(), request.amount(), request.idempotencyKey());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/capture")
    public ResponseEntity<Void> capture(@RequestBody CaptureRequest request) {
        transactionService.captureFunds(request.idempotencyKey());
        return ResponseEntity.ok().build();
    }

    // Выполнить перевод денег между счетами
    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.ok(transactionService.transfer(request));
    }
    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit() {
        // Безопасно передаем email пользователя из токена и данные запроса (accountId, amount)
        TransactionResponse response = transactionService.makeDeposit();
        return ResponseEntity.ok(response);
    }

    // Получить историю транзакций по счету с пагинацией
    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getHistory(
            @RequestParam Long accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(transactionService.getAccountHistory(accountId, pageable));
    }
}
