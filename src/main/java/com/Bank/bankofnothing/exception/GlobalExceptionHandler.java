package com.Bank.bankofnothing.exception;

<<<<<<< HEAD
=======

import com.Bank.bankofnothing.dto.ErrorResponse;
>>>>>>> 60345e155da99dc48bae528858e0be91e1dabaff
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

<<<<<<< HEAD
    // Страховочный перехватчик для ВСЕХ остальных непредвиденных ошибок
    @ExceptionHandler(InsufficientFundsException.class)
    public ResponseEntity<Map<String, String>> handleAllOtherExceptions(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Произошла внутренняя ошибка сервера. Попробуйте позже.");
=======
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllOtherExeptions(Exception ex){
        ErrorResponse error = new ErrorResponse(
                "INTERNAL_SERVER_ERROR",
                "Произошла непредвиденая ошибка на сервере. Попробуйте позже",
                Instant.now()
        );
>>>>>>> 60345e155da99dc48bae528858e0be91e1dabaff
        ex.printStackTrace();
        return new ResponseEntity<>(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }
<<<<<<< HEAD

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> handleInsufficientFunds(InsufficientFundsException ex){
        Map<String,String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return new ResponseEntity<>(error,HttpStatus.BAD_REQUEST);
    }

=======
>>>>>>> 60345e155da99dc48bae528858e0be91e1dabaff
}
