package com.phegondev.InventoryMgtSystem.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TransactionUpdateRequestBody {

    @NotBlank(message = "requestMessage is required")
    private String requestMessage;
}