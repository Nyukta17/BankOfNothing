package com.Bank.bankofnothing.security;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class AccountNumberGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * 19 случайных цифр + контрольная цифра Luhn = 20 символов.
     */
    public String generate() {
        StringBuilder sb = new StringBuilder(20);
        for (int i = 0; i < 19; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        sb.append(luhnCheckDigit(sb.toString()));
        return sb.toString();
    }

    /**
     * Вычисляет контрольную цифру Luhn для строки из цифр (без контрольной).
     */
    public int luhnCheckDigit(String digitsWithoutCheck) {
        int sum = 0;
        boolean doubleIt = true; // для позиции контрольной цифры удваиваем справа налево
        for (int i = digitsWithoutCheck.length() - 1; i >= 0; i--) {
            int d = digitsWithoutCheck.charAt(i) - '0';
            if (doubleIt) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            doubleIt = !doubleIt;
        }
        return (10 - (sum % 10)) % 10;
    }

    /**
     * Проверка валидности номера (пригодится при переводе по номеру).
     */
    public boolean isValid(String number) {
        if (number == null || number.length() != 20 || !number.chars().allMatch(Character::isDigit)) {
            return false;
        }
        String body = number.substring(0, 19);
        int expected = luhnCheckDigit(body);
        int actual = number.charAt(19) - '0';
        return expected == actual;
    }
}
