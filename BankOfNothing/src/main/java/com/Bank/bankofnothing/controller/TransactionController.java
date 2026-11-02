package com.Bank.bankofnothing.controller;

import com.Bank.bankofnothing.dto.*;
import com.Bank.bankofnothing.security.JwtCore;
import com.Bank.bankofnothing.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final JwtCore jwtCore;
    public TransactionController(TransactionService transactionService, JwtCore jwtCore) {
        this.transactionService = transactionService;
        this.jwtCore = jwtCore;
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
    @PostMapping("/demo-topup")
    public ResponseEntity<Void> demoTopup(@RequestBody DemoFundsRequest request) {
        transactionService.injectDemoFunds(request.getAccountIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> transferByAccountNumber(@Valid @RequestBody TransferByNumberRequest transferByNumberRequest){

        return ResponseEntity.ok(transactionService.transferByAccountNumber(transferByNumberRequest));
    }
    // Получить историю транзакций по счету с пагинацией
    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getHistory(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String token = authHeader.substring(7);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(transactionService.getAccountHistory(jwtCore.getIdFromToken(token), pageable));
    }
}
