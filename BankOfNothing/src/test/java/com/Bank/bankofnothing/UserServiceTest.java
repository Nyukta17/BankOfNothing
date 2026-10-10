package com.Bank.bankofnothing;

import com.Bank.bankofnothing.dto.RegisterRequest;
import com.Bank.bankofnothing.dto.UserResponse;
import com.Bank.bankofnothing.entity.User;
import com.Bank.bankofnothing.exception.EmailAlreadyExistsException;
import com.Bank.bankofnothing.repository.UserRepository;
import com.Bank.bankofnothing.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private UserService userService;

    private RegisterRequest request;

    @BeforeEach
    void setUp(){
        request = new RegisterRequest();
        request.setEmail("test@bank.com");
        request.setPassword("secretPassword");
        request.setFullName("Ivan Ivanov");
    }
    @Test
    void register_Success(){
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed_password");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail(request.getEmail());
        savedUser.setPasswordHash("hashed_password");
        savedUser.setFullName(request.getFullName());

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserResponse response = userService.register(request);

        assertNotNull(response);
        assertEquals(1L,response.getId());
        assertEquals("test@bank.com",response.getEmail());

        verify(userRepository,times(1)).save(any(User.class));

    }
    @Test
    void register_ThrowsException_WhenEmailExists(){
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class,()->userService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
