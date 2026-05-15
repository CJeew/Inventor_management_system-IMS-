package com.phegondev.InventoryMgtSystem.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TransactionAdminUpdateRequest {

    @NotNull(message = "productId is required")
    @Positive(message = "productId must be positive")
    private Long productId;

    @NotNull(message = "quantity is required")
    @Positive(message = "quantity must be positive")
    private Integer quantity;

    private TransactionStatus status;

    private String description;

    private String note;
}