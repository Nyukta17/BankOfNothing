package com.Bank.bankofnothing;

import com.Bank.bankofnothing.dto.RegisterRequest;
import com.Bank.bankofnothing.dto.UserResponse;
import com.Bank.bankofnothing.dto.LoginRequest;
import com.Bank.bankofnothing.dto.JwtResponse;
import com.Bank.bankofnothing.dto.AccountRequest;
import com.Bank.bankofnothing.dto.AccountResponse;
import com.Bank.bankofnothing.dto.TransferRequest;
import com.Bank.bankofnothing.dto.TransactionResponse;
import com.Bank.bankofnothing.entity.Account;
import com.Bank.bankofnothing.repository.AccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.http.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class UserAndTransactionIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private AccountRepository accountRepository;

    @Test
    void fullBankWorkflowTest() {
        // 1. Тест регистрации пользователя
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail("integration@test.com");
        registerReq.setPassword("password123");
        registerReq.setFullName("Integration User");

        ResponseEntity<UserResponse> regResponse = restTemplate.postForEntity(
                "/api/users/register", registerReq, UserResponse.class
        );
        assertEquals(HttpStatus.CREATED, regResponse.getStatusCode());
        assertNotNull(regResponse.getBody());
        assertEquals("integration@test.com", regResponse.getBody().getEmail());

        // 2. Тест авторизации (Получение токена)
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("integration@test.com");
        loginReq.setPassword("password123");

        ResponseEntity<JwtResponse> loginResponse = restTemplate.postForEntity(
                "/api/auth/login", loginReq, JwtResponse.class
        );
        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        String token = loginResponse.getBody().getToken();
        assertNotNull(token);

        // Настраиваем заголовки с Bearer токеном для защищенных запросов
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 3. Тест создания счета
        AccountRequest accountReq = new AccountRequest();
        accountReq.setCurrency("RUB");
        HttpEntity<AccountRequest> accountEntity = new HttpEntity<>(accountReq, headers);

        ResponseEntity<AccountResponse> account1Resp = restTemplate.postForEntity(
                "/api/accounts", accountEntity, AccountResponse.class
        );
        assertEquals(HttpStatus.CREATED, account1Resp.getStatusCode());
        Long fromAccountId = account1Resp.getBody().getId();

        ResponseEntity<AccountResponse> account2Resp = restTemplate.postForEntity(
                "/api/accounts", accountEntity, AccountResponse.class
        );
        Long toAccountId = account2Resp.getBody().getId();

        // 4. Имитируем пополнение счета через репозиторий (начисляем баланс в реальную тест-БД)
        Account fromAccount = accountRepository.findById(fromAccountId).orElseThrow();
        fromAccount.setBalance(new BigDecimal("10000.00"));
        accountRepository.save(fromAccount);

        // 5. Тест выполнения перевода (Transaction Transfer)
        TransferRequest transferReq = new TransferRequest();
        transferReq.setFromAccountId(fromAccountId);
        transferReq.setToAccountId(toAccountId);
        transferReq.setAmount(new BigDecimal("2500.00"));
        HttpEntity<TransferRequest> transferEntity = new HttpEntity<>(transferReq, headers);

        ResponseEntity<TransactionResponse> transferResp = restTemplate.postForEntity(
                "/api/transactions/transfer", transferEntity, TransactionResponse.class
        );

        assertEquals(HttpStatus.OK, transferResp.getStatusCode());
        assertNotNull(transferResp.getBody());
        assertEquals("SUCCESS", transferResp.getBody().getStatus());

        // 6. Проверяем финальные балансы в базе данных
        Account finalFrom = accountRepository.findById(fromAccountId).orElseThrow();
        Account finalTo = accountRepository.findById(toAccountId).orElseThrow();
        assertEquals(new BigDecimal("7500.00"), finalFrom.getBalance());
        assertEquals(new BigDecimal("2500.00"), finalTo.getBalance());
    }
}
