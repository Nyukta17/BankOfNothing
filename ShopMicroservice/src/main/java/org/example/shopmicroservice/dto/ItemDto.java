package org.example.shopmicroservice.dto;
import jakarta.validation.constraints.*;

public record ItemDto(
        @NotNull Long productId,
        @Min(1) Integer quantity
) {}