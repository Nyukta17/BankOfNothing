package com.Bank.bankofnothing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountRequest {
    @NotBlank(message = "Валюта не должна быть пустой")
    @Size(min = 3, max = 3, message = "Код валюты должен состоять строго из 3 букв")
    private String currency;
}
