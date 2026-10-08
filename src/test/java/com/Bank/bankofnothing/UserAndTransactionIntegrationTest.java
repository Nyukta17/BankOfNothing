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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient // Включает автоконфигурацию бина RestTestClient
class UserAndTransactionIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private RestTestClient restClient; // Внедряем корректный бин для Spring Boot 4

    @Autowired
    private AccountRepository accountRepository;

    @Test
    void fullBankWorkflowTest() {
        // 1. Тест регистрации пользователя
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail("integration@test.com");
        registerReq.setPassword("password123");
        registerReq.setFullName("Integration User");

        UserResponse regResponseBody = restClient.post()
                .uri("/api/users/register")
                .body(registerReq)
                .exchange()
                .expectStatus().isCreated() // Автоматическая проверка HttpStatus.CREATED (201)
                .expectBody(UserResponse.class)
                .returnResult().getResponseBody();

        assertNotNull(regResponseBody);
        assertEquals("integration@test.com", regResponseBody.getEmail());

        // 2. Тест авторизации (Получение токена)
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("integration@test.com");
        loginReq.setPassword("password123");

        JwtResponse loginResponseBody = restClient.post()
                .uri("/api/auth/login")
                .body(loginReq)
                .exchange()
                .expectStatus().isOk() // Автоматическая проверка HttpStatus.OK (200)
                .expectBody(JwtResponse.class)
                .returnResult().getResponseBody();

        assertNotNull(loginResponseBody);
        String token = loginResponseBody.getToken();
        assertNotNull(token);

        // 3. Тест создания первого счета (с Bearer авторизацией)
        AccountRequest accountReq = new AccountRequest();
        accountReq.setCurrency("RUB");

        AccountResponse account1Resp = restClient.post()
                .uri("/api/accounts")
                .headers(headers -> headers.setBearerAuth(token)) // Установка токена напрямую
                .body(accountReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(AccountResponse.class)
                .returnResult().getResponseBody();

        assertNotNull(account1Resp);
        Long fromAccountId = account1Resp.getId();

        // Тест создания второго счета
        AccountResponse account2Resp = restClient.post()
                .uri("/api/accounts")
                .headers(headers -> headers.setBearerAuth(token))
                .body(accountReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(AccountResponse.class)
                .returnResult().getResponseBody();

        assertNotNull(account2Resp);
        Long toAccountId = account2Resp.getId();

        // 4. Имитируем пополнение счета через репозиторий
        Account fromAccount = accountRepository.findById(fromAccountId).orElseThrow();
        fromAccount.setBalance(new BigDecimal("10000.00"));
        accountRepository.save(fromAccount);

        // 5. Тест выполнения перевода (Transaction Transfer)
        TransferRequest transferReq = new TransferRequest();
        transferReq.setFromAccountId(fromAccountId);
        transferReq.setToAccountId(toAccountId);
        transferReq.setAmount(new BigDecimal("2500.00"));
        transferReq.setIdempotencyKey(java.util.UUID.randomUUID().toString());
        TransactionResponse transferResp = restClient.post()
                .uri("/api/transactions/transfer")
                .headers(headers -> headers.setBearerAuth(token))
                .body(transferReq)
                .exchange()
                .expectStatus().isOk()
                .expectBody(TransactionResponse.class)
                .returnResult().getResponseBody();

        assertNotNull(transferResp);
        assertEquals("SUCCESS", transferResp.getStatus());

        // 6. Проверяем финальные балансы в базе данных
        Account finalFrom = accountRepository.findById(fromAccountId).orElseThrow();
        Account finalTo = accountRepository.findById(toAccountId).orElseThrow();
        assertEquals(0, new BigDecimal("7500.00").compareTo(finalFrom.getBalance()));
        assertEquals(0, new BigDecimal("2500.00").compareTo(finalTo.getBalance()));
    }
}
