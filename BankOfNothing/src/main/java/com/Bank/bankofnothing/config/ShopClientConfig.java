package com.Bank.bankofnothing.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class ShopClientConfig {

    @Value("${shop.service.url:http://localhost:8081}")
    private String shopServiceUrl;

    @Bean
    public RestClient shopRestClient(){
        return RestClient.builder()
                .baseUrl(shopServiceUrl)
                .build();
    }
}
