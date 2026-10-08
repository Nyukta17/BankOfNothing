package com.Bank.bankofnothing;

import com.Bank.bankofnothing.dto.TransferRequest;
import com.Bank.bankofnothing.dto.TransactionResponse;
import com.Bank.bankofnothing.entity.Account;
import com.Bank.bankofnothing.entity.User;
import com.Bank.bankofnothing.exception.InsufficientFundsException;
import com.Bank.bankofnothing.repository.AccountRepository;
import com.Bank.bankofnothing.repository.TransactionRepository;
import com.Bank.bankofnothing.repository.UserRepository;
import com.Bank.bankofnothing.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User currentUser;
    private Account fromAccount;
    private Account toAccount;
    private TransferRequest request;

    @BeforeEach
    void setUp() {
        // Заглушка для контекста Spring Security (эмуляция авторизованного юзера)
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("test@bank.com");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setEmail("test@bank.com");

        fromAccount = new Account();
        fromAccount.setId(10L);
        fromAccount.setUser(currentUser);
        fromAccount.setBalance(new BigDecimal("5000.00"));
        fromAccount.setCurrency("RUB");

        toAccount = new Account();
        toAccount.setId(20L);
        toAccount.setUser(currentUser);
        toAccount.setBalance(new BigDecimal("1000.00"));
        toAccount.setCurrency("RUB");

        request = new TransferRequest();
        request.setFromAccountId(10L);
        request.setToAccountId(20L);
        request.setAmount(new BigDecimal("1500.00"));
    }

    @Test
    void transfer_Success() {
        // Arrange
        when(userRepository.findByEmail("test@bank.com")).thenReturn(Optional.of(currentUser));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findById(20L)).thenReturn(Optional.of(toAccount));

        when(transactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        TransactionResponse response = transactionService.transfer(request);

        // Assert
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(new BigDecimal("3500.00"), fromAccount.getBalance()); // 5000 - 1500
        assertEquals(new BigDecimal("2500.00"), toAccount.getBalance());   // 1000 + 1500

        verify(accountRepository, times(1)).save(fromAccount);
        verify(accountRepository, times(1)).save(toAccount);
    }

    @Test
    void transfer_ThrowsInsufficientFundsException() {
        // Arrange: ставим сумму перевода больше, чем баланс (6000 > 5000)
        request.setAmount(new BigDecimal("6000.00"));

        when(userRepository.findByEmail("test@bank.com")).thenReturn(Optional.of(currentUser));
        when(accountRepository.findById(10L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findById(20L)).thenReturn(Optional.of(toAccount));

        // Act & Assert
        assertThrows(InsufficientFundsException.class, () -> transactionService.transfer(request));

        // Балансы не должны измениться
        assertEquals(new BigDecimal("5000.00"), fromAccount.getBalance());
        verify(accountRepository, never()).save(any());
    }
}
