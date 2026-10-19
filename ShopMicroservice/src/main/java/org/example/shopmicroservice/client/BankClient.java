package org.example.shopmicroservice.client;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class BankClient {

    private final RestClient bankRestClient;

    public record HoldRequest(Long accountId, BigDecimal amount, String idempotencyKey) {}
    public record CaptureRequest(String idempotencyKey) {}

    public void holdFunds(Long accountId, BigDecimal amount, String idempotencyKey) {
        bankRestClient.post()
                .uri("/api/transactions/hold")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new HoldRequest(accountId, amount, idempotencyKey))
                .retrieve()
                .toBodilessEntity();
    }

    public void captureFunds(String idempotencyKey) {
        bankRestClient.post()
                .uri("/api/transactions/capture")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new CaptureRequest(idempotencyKey))
                .retrieve()
                .toBodilessEntity();
    }
}
