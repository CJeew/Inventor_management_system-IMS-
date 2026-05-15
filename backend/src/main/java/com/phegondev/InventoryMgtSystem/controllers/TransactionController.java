package com.phegondev.InventoryMgtSystem.controllers;

import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.dtos.TransactionAdminUpdateRequest;
import com.phegondev.InventoryMgtSystem.dtos.TransactionRequest;
import com.phegondev.InventoryMgtSystem.dtos.TransactionUpdateRequestBody;
import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import com.phegondev.InventoryMgtSystem.services.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {


    private final TransactionService transactionService;

    @PostMapping("/purchase")
    public ResponseEntity<Response> purchaseInventory(@RequestBody @Valid TransactionRequest transactionRequest) {
        return ResponseEntity.ok(transactionService.purchase(transactionRequest));
    }

    @PostMapping("/sell")
    public ResponseEntity<Response> makeSale(@RequestBody @Valid TransactionRequest transactionRequest) {
        return ResponseEntity.ok(transactionService.sell(transactionRequest));
    }

    @PostMapping("/return")
    public ResponseEntity<Response> returnToSupplier(@RequestBody @Valid TransactionRequest transactionRequest) {
        return ResponseEntity.ok(transactionService.returnToSupplier(transactionRequest));
    }

    @GetMapping("/all")
    public ResponseEntity<Response> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size,
            @RequestParam(required = false) String filter) {

        System.out.println("SEARCH VALUE IS: " +filter);
        return ResponseEntity.ok(transactionService.getAllTransactions(page, size, filter));
    }


    @GetMapping("/{id}")
    public ResponseEntity<Response> getTransactionById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getAllTransactionById(id));
    }

    @GetMapping("/by-month-year")
    public ResponseEntity<Response> getTransactionByMonthAndYear(
            @RequestParam int month,
            @RequestParam int year) {

        return ResponseEntity.ok(transactionService.getAllTransactionByMonthAndYear(month, year));
    }

    @PutMapping("/{transactionId}")
    public ResponseEntity<Response> updateTransactionStatus(
            @PathVariable Long transactionId,
            @RequestBody TransactionStatus status) {

        return ResponseEntity.ok(transactionService.updateTransactionStatus(transactionId, status));
    }

    @PutMapping("/{transactionId}/edit")
    public ResponseEntity<Response> updateTransactionDetails(
            @PathVariable Long transactionId,
            @RequestBody @Valid TransactionAdminUpdateRequest request) {

        return ResponseEntity.ok(transactionService.updateTransactionDetails(transactionId, request));
    }

    @PostMapping("/{transactionId}/update-request")
    public ResponseEntity<Response> requestTransactionUpdate(
            @PathVariable Long transactionId,
            @RequestBody @Valid TransactionUpdateRequestBody payload) {

        return ResponseEntity.ok(
                transactionService.requestTransactionUpdate(transactionId, payload.getRequestMessage())
        );
    }

    @GetMapping("/{transactionId}/update-request")
    public ResponseEntity<Response> getTransactionUpdateRequests(@PathVariable Long transactionId) {
        return ResponseEntity.ok(transactionService.getTransactionUpdateRequests(transactionId));
    }

    @DeleteMapping("/delete/{transactionId}")
    public ResponseEntity<Response> deleteTransaction(@PathVariable Long transactionId) {
        log.info("Received delete request for transactionId={}", transactionId);
        Response res = transactionService.deleteTransaction(transactionId);
        log.info("Delete result: status={} message={}", res.getStatus(), res.getMessage());
        return ResponseEntity.ok(res);
    }


}
