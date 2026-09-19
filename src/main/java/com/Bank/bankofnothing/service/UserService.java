package com.Bank.bankofnothing.service;

import com.Bank.bankofnothing.dto.RegisterRequest;
import com.Bank.bankofnothing.dto.UserResponse;
import com.Bank.bankofnothing.entity.User;
import com.Bank.bankofnothing.exception.EmailAlreadyExistsException;
import com.Bank.bankofnothing.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public  UserService(UserRepository userRepository,PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    @Transactional
    public UserResponse register(RegisterRequest request){
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Этот email уже зарегистрирован в системе!"); // Исправлено
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();
        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setFullName(savedUser.getFullName());
        response.setCreatedAt(savedUser.getCreatedAt());
        return  response;
    }
}
