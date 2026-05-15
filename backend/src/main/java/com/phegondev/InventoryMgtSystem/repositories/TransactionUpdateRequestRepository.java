package com.phegondev.InventoryMgtSystem.repositories;

import com.phegondev.InventoryMgtSystem.models.TransactionUpdateRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionUpdateRequestRepository extends JpaRepository<TransactionUpdateRequest, Long> {
    List<TransactionUpdateRequest> findByTransactionIdOrderByCreatedAtDesc(Long transactionId);

    List<TransactionUpdateRequest> findAllByOrderByCreatedAtDesc();
}