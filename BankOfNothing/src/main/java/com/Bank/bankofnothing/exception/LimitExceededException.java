package com.Bank.bankofnothing.exception;

public class LimitExceededException extends  RuntimeException{
    public LimitExceededException(String message){
        super(message);
    }
}
