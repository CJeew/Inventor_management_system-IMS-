package com.phegondev.InventoryMgtSystem.models;

import com.phegondev.InventoryMgtSystem.enums.UserRole;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_update_requests")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionUpdateRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long transactionId;
    private Long requesterUserId;
    private String requesterName;
    private String requesterEmail;

    @Enumerated(EnumType.STRING)
    private UserRole requesterRole;

    private String requestMessage;
    private String adminResponse;
    private boolean resolved;

    private final LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
}