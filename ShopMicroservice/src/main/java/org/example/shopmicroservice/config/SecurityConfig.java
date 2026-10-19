package org.example.shopmicroservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.RestClient;

@Configuration
public class SecurityConfig {
    @Value("${bank.service.url:http://localhost:8080}")
    private String bankServiceUrl;
    @Bean
    public RestClient bankRestClient(){
      return RestClient.builder()
              .baseUrl(bankServiceUrl)
              .build();
    };
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // Открываем всё для беспрепятственной REST-интеграции
                );
        return http.build();
    }
}