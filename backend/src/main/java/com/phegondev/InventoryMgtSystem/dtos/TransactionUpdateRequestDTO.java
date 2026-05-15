package com.phegondev.InventoryMgtSystem.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.phegondev.InventoryMgtSystem.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionUpdateRequestDTO {

    private Long id;
    private Long transactionId;
    private Long requesterUserId;
    private String requesterName;
    private String requesterEmail;
    private UserRole requesterRole;
    private String requestMessage;
    private String adminResponse;
    private boolean resolved;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}