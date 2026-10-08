package com.Bank.bankofnothing.exception;



import com.Bank.bankofnothing.dto.ErrorResponse;


import com.Bank.bankofnothing.dto.ErrorResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailExists (EmailAlreadyExistsException ex){
        ErrorResponse error = new ErrorResponse(
                "EMAIL_ALREADY_EXISTS",
                ex.getMessage(),
                Instant.now()
        );
        return new ResponseEntity<>(error,HttpStatus.BAD_REQUEST);

    }

    @ExceptionHandler(InsufficientFundsException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientFunds(InsufficientFundsException ex) {
        ErrorResponse error = new ErrorResponse(
                "INSUFFICIENT_FUNDS",
                ex.getMessage(),
                Instant.now()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST); // 400
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex){
        String details = ex.getBindingResult().getFieldErrors().stream()
                .map(error ->error.getField()+": "+error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        ErrorResponse error = new ErrorResponse(
                "VALIDATION_ERROR",
                details,
                Instant.now()
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllOtherExceptions(Exception ex){
        ErrorResponse error = new ErrorResponse(
                "INTERNAL_SERVER_ERROR",
                "Произошла непредвиденая ошибка на сервере. Попробуйте позже",
                Instant.now()
        );

        ex.printStackTrace();
        return new ResponseEntity<>(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<com.Bank.bankofnothing.dto.ErrorResponse> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex){
        com.Bank.bankofnothing.dto.ErrorResponse error = new ErrorResponse(
                "DUPLICATE_REQUEST",
                "Запрос с таким Idempotency-Key уже был обработан системой.",
                java.time.Instant.now()
        );
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    };
    @ExceptionHandler(LimitExceededException.class)
    public ResponseEntity<com.Bank.bankofnothing.dto.ErrorResponse>  handleLimitExceeded(LimitExceededException ex){
        com.Bank.bankofnothing.dto.ErrorResponse error = new com.Bank.bankofnothing.dto.ErrorResponse(
                "LIMIT_EXCEEDED",
                ex.getMessage(),
                java.time.Instant.now()
        );
        return new ResponseEntity<>(error, org.springframework.http.HttpStatus.BAD_REQUEST);
    }
}
