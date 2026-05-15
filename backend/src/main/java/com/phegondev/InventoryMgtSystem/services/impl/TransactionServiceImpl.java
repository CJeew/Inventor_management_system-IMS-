package com.phegondev.InventoryMgtSystem.services.impl;


import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.dtos.TransactionAdminUpdateRequest;
import com.phegondev.InventoryMgtSystem.dtos.TransactionDTO;
import com.phegondev.InventoryMgtSystem.dtos.TransactionRequest;
import com.phegondev.InventoryMgtSystem.dtos.TransactionUpdateRequestDTO;
import com.phegondev.InventoryMgtSystem.enums.TransactionStatus;
import com.phegondev.InventoryMgtSystem.enums.TransactionType;
import com.phegondev.InventoryMgtSystem.enums.UserRole;
import com.phegondev.InventoryMgtSystem.exceptions.NameValueRequiredException;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Product;
import com.phegondev.InventoryMgtSystem.models.Supplier;
import com.phegondev.InventoryMgtSystem.models.Transaction;
import com.phegondev.InventoryMgtSystem.models.TransactionUpdateRequest;
import com.phegondev.InventoryMgtSystem.models.User;
import com.phegondev.InventoryMgtSystem.repositories.ProductRepository;
import com.phegondev.InventoryMgtSystem.repositories.SupplierRepository;
import com.phegondev.InventoryMgtSystem.repositories.TransactionRepository;
import com.phegondev.InventoryMgtSystem.repositories.TransactionUpdateRequestRepository;
import com.phegondev.InventoryMgtSystem.services.TransactionService;
import com.phegondev.InventoryMgtSystem.services.UserService;
import com.phegondev.InventoryMgtSystem.specification.TransactionFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserService userService;
        private final TransactionUpdateRequestRepository transactionUpdateRequestRepository;
    private final ModelMapper modelMapper;

    @Override
    public Response purchase(TransactionRequest transactionRequest) {

        Long productId = transactionRequest.getProductId();
        Long supplierId = transactionRequest.getSupplierId();
        Integer quantity = transactionRequest.getQuantity();

        if (supplierId == null) throw new NameValueRequiredException("Supplier Id is Required");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new NotFoundException("Supplier Not Found"));

        User user = userService.getCurrentLoggedInUser();

        //update the stock quantity and re-save
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);

        //create a transaction
        Transaction transaction = Transaction.builder()
                .transactionType(TransactionType.PURCHASE)
                .status(TransactionStatus.COMPLETED)
                .product(product)
                .user(user)
                .supplier(supplier)
                .totalProducts(quantity)
                .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(quantity)))
                .description(transactionRequest.getDescription())
                .note(transactionRequest.getNote())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        TransactionDTO created = new TransactionDTO();
        created.setId(saved.getId());
        return Response.builder()
                .status(200)
                .message("Purchase Made successfully")
                .transaction(created)
                .build();

    }

    @Override
    public Response sell(TransactionRequest transactionRequest) {

        Long productId = transactionRequest.getProductId();
        Integer quantity = transactionRequest.getQuantity();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        if (product.getStockQuantity() < quantity) {
            throw new NameValueRequiredException("Insufficient stock. Available: " + product.getStockQuantity());
        }

        User user = userService.getCurrentLoggedInUser();

        //update the stock quantity and re-save
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);


        //create a transaction
        Transaction transaction = Transaction.builder()
                .transactionType(TransactionType.SALE)
                .status(TransactionStatus.COMPLETED)
                .product(product)
                .user(user)
                .totalProducts(quantity)
                .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(quantity)))
                .description(transactionRequest.getDescription())
                .note(transactionRequest.getNote())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        TransactionDTO created = new TransactionDTO();
        created.setId(saved.getId());
        return Response.builder()
                .status(200)
                .message("Product Sale successfully made")
                .transaction(created)
                .build();


    }

    @Override
    public Response returnToSupplier(TransactionRequest transactionRequest) {

        Long productId = transactionRequest.getProductId();
        Long supplierId = transactionRequest.getSupplierId();
        Integer quantity = transactionRequest.getQuantity();

        if (supplierId == null) throw new NameValueRequiredException("Supplier Id is Required");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new NotFoundException("Supplier Not Found"));

        User user = userService.getCurrentLoggedInUser();

        //update the stock quantity and re-save
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);


        //create a transaction
        Transaction transaction = Transaction.builder()
                .transactionType(TransactionType.RETURN_TO_SUPPLIER)
                .status(TransactionStatus.PROCESSING)
                .product(product)
                .user(user)
                .supplier(supplier)
                .totalProducts(quantity)
                .totalPrice(BigDecimal.ZERO)
                .description(transactionRequest.getDescription())
                .note(transactionRequest.getNote())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        TransactionDTO created = new TransactionDTO();
        created.setId(saved.getId());

        return Response.builder()
                .status(200)
                .message("Product Returned in progress")
                .transaction(created)
                .build();

    }

    @Override
    public Response getAllTransactions(int page, int size, String filter) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        //user the Transaction specification
        Specification<Transaction> spec = TransactionFilter.byFilter(filter);
        Page<Transaction> transactionPage = transactionRepository.findAll(spec, pageable);

        List<TransactionDTO> transactionDTOS = modelMapper.map(transactionPage.getContent(), new TypeToken<List<TransactionDTO>>() {
        }.getType());

        // Keep product + supplier on list rows for UI traceability; omit user summary fields only
        transactionDTOS.forEach(transactionDTO -> transactionDTO.setUser(null));

        return Response.builder()
                .status(200)
                .message("success")
                .transactions(transactionDTOS)
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .build();

    }

    @Override
    public Response getAllTransactionById(Long id) {

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

        TransactionDTO transactionDTO = modelMapper.map(transaction, TransactionDTO.class);

        transactionDTO.getUser().setTransactions(null);

        return Response.builder()
                .status(200)
                .message("success")
                .transaction(transactionDTO)
                .build();
    }

    @Override
    public Response getAllTransactionByMonthAndYear(int month, int year) {
        List<Transaction> transactions = transactionRepository.findAll(TransactionFilter.byMonthAndYear(month, year));

        List<TransactionDTO> transactionDTOS = modelMapper.map(transactions, new TypeToken<List<TransactionDTO>>() {
        }.getType());

        transactionDTOS.forEach(transactionDTO -> transactionDTO.setUser(null));

        return Response.builder()
                .status(200)
                .message("success")
                .transactions(transactionDTOS)
                .build();
    }

    @Override
    @Transactional
    public Response updateTransactionStatus(Long transactionId, TransactionStatus status) {

        Transaction existingTransaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

                User actor = userService.getCurrentLoggedInUser();
                if (actor.getRole() != UserRole.ADMIN) {
                        throw new NameValueRequiredException("Only administrators can update transaction details.");
                }

        if (existingTransaction.getStatus() == TransactionStatus.CANCELLED
                && status != TransactionStatus.CANCELLED) {
            throw new NameValueRequiredException("Cancelled transactions cannot be reactivated.");
        }

        if (status == TransactionStatus.CANCELLED
                && existingTransaction.getStatus() != TransactionStatus.CANCELLED) {
            applyStockReversalForCancellation(existingTransaction);
        }

        existingTransaction.setStatus(status);
        existingTransaction.setUpdateAt(LocalDateTime.now());

        transactionRepository.save(existingTransaction);

        return Response.builder()
                .status(200)
                .message("Transaction Status Successfully Updated")
                .build();
    }

        @Override
        @Transactional
        public Response updateTransactionDetails(Long transactionId, TransactionAdminUpdateRequest request) {
                Transaction existingTransaction = transactionRepository.findById(transactionId)
                                .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

                User actor = userService.getCurrentLoggedInUser();
                if (actor.getRole() != UserRole.ADMIN) {
                        throw new NameValueRequiredException("Only administrators can edit transaction records.");
                }

                TransactionStatus nextStatus = request.getStatus() != null ? request.getStatus() : existingTransaction.getStatus();
                if (existingTransaction.getStatus() == TransactionStatus.CANCELLED
                                && nextStatus != TransactionStatus.CANCELLED) {
                        throw new NameValueRequiredException("Cancelled transactions cannot be reactivated.");
                }

                boolean productChanged = existingTransaction.getProduct() == null
                        || request.getProductId() == null
                        || !existingTransaction.getProduct().getId().equals(request.getProductId());
                boolean quantityChanged = existingTransaction.getTotalProducts() == null
                        || request.getQuantity() == null
                        || !existingTransaction.getTotalProducts().equals(request.getQuantity());

                if (existingTransaction.getStatus() == TransactionStatus.CANCELLED && (productChanged || quantityChanged)) {
                    throw new NameValueRequiredException("Cancelled transactions cannot change product or quantity.");
                }

                Product originalProduct = existingTransaction.getProduct();
                Integer originalQuantity = existingTransaction.getTotalProducts();

                if (existingTransaction.getStatus() != TransactionStatus.CANCELLED) {
                        reverseTransactionStock(existingTransaction, originalProduct, originalQuantity);
                }

                Product updatedProduct = productRepository.findById(request.getProductId())
                                .orElseThrow(() -> new NotFoundException("Product Not Found"));
                Integer updatedQuantity = request.getQuantity();

                if (nextStatus != TransactionStatus.CANCELLED) {
                        applyTransactionStock(updatedProduct, existingTransaction.getTransactionType(), updatedQuantity);
                }

                BigDecimal updatedTotalPrice = calculateTotalPrice(existingTransaction.getTransactionType(), updatedProduct, updatedQuantity);

                existingTransaction.setProduct(updatedProduct);
                existingTransaction.setTotalProducts(updatedQuantity);
                existingTransaction.setTotalPrice(updatedTotalPrice);
                existingTransaction.setStatus(nextStatus);
                if (request.getDescription() != null) {
                        existingTransaction.setDescription(request.getDescription().trim());
                }
                if (request.getNote() != null) {
                        existingTransaction.setNote(request.getNote().trim());
                }
                existingTransaction.setUpdateAt(LocalDateTime.now());

                transactionRepository.save(existingTransaction);

                return Response.builder()
                                .status(200)
                                .message("Transaction details successfully updated")
                                .build();
        }

    @Override
    @Transactional
    public Response requestTransactionUpdate(Long transactionId, String requestMessage) {
        Transaction existingTransaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

        User requester = userService.getCurrentLoggedInUser();
        if (requester.getRole() == UserRole.ADMIN) {
            throw new NameValueRequiredException("Administrators can update transaction details directly.");
        }

        String trimmedMessage = requestMessage == null ? "" : requestMessage.trim();
        if (trimmedMessage.isEmpty()) {
            throw new NameValueRequiredException("Request message is required.");
        }

        TransactionUpdateRequest request = TransactionUpdateRequest.builder()
                .transactionId(existingTransaction.getId())
                .requesterUserId(requester.getId())
                .requesterName(requester.getName())
                .requesterEmail(requester.getEmail())
                .requesterRole(requester.getRole())
                .requestMessage(trimmedMessage)
                .resolved(false)
                .build();

        TransactionUpdateRequest saved = transactionUpdateRequestRepository.save(request);

        return Response.builder()
                .status(200)
                .message("Update request sent to admin.")
                .transactionUpdateRequest(modelMapper.map(saved, TransactionUpdateRequestDTO.class))
                .build();
    }

    @Override
    public Response getTransactionUpdateRequests(Long transactionId) {
        transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

        User actor = userService.getCurrentLoggedInUser();
        if (actor.getRole() != UserRole.ADMIN) {
            throw new NameValueRequiredException("Only administrators can view transaction update requests.");
        }

        List<TransactionUpdateRequestDTO> requests = modelMapper.map(
                transactionUpdateRequestRepository.findByTransactionIdOrderByCreatedAtDesc(transactionId),
                new TypeToken<List<TransactionUpdateRequestDTO>>() {}.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .transactionUpdateRequests(requests)
                .build();
    }

        @Override
        @Transactional
        public Response deleteTransaction(Long transactionId) {
                Transaction existingTransaction = transactionRepository.findById(transactionId)
                                .orElseThrow(() -> new NotFoundException("Transaction Not Found"));

                User actor = userService.getCurrentLoggedInUser();
                if (actor.getRole() != UserRole.ADMIN) {
                        throw new NameValueRequiredException("Only administrators can delete transactions.");
                }

                // If transaction not already cancelled, reverse stock first to keep inventory consistent
                if (existingTransaction.getStatus() != TransactionStatus.CANCELLED) {
                        applyStockReversalForCancellation(existingTransaction);
                }

                transactionRepository.delete(existingTransaction);

                return Response.builder()
                                .status(200)
                                .message("Transaction Deleted successfully")
                                .build();
        }

    /**
     * Undo inventory movement for this transaction when it is voided (status CANCELLED).
     * PURCHASE had increased stock; SALE and RETURN_TO_SUPPLIER had decreased stock.
     */
    private void applyStockReversalForCancellation(Transaction tx) {
        if (tx.getProduct() == null) {
            throw new NameValueRequiredException("Transaction has no linked product; cannot reverse stock.");
        }
        Product product = productRepository.findById(tx.getProduct().getId())
                .orElseThrow(() -> new NotFoundException("Product Not Found"));
        int qty = tx.getTotalProducts() != null ? tx.getTotalProducts() : 0;
        int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;

        switch (tx.getTransactionType()) {
            case PURCHASE -> {
                int next = current - qty;
                if (next < 0) {
                    throw new NameValueRequiredException(
                            "Cannot void purchase: resulting stock would be negative. Adjust stock first.");
                }
                product.setStockQuantity(next);
            }
            case SALE, RETURN_TO_SUPPLIER -> product.setStockQuantity(current + qty);
            default -> throw new NameValueRequiredException(
                    "Unsupported transaction type for void: " + tx.getTransactionType());
        }
        productRepository.save(product);
    }

        private void reverseTransactionStock(Transaction tx, Product product, Integer quantity) {
                if (product == null) {
                        throw new NameValueRequiredException("Transaction has no linked product; cannot reverse stock.");
                }
                Product currentProduct = productRepository.findById(product.getId())
                                .orElseThrow(() -> new NotFoundException("Product Not Found"));
                int qty = quantity != null ? quantity : 0;
                int current = currentProduct.getStockQuantity() != null ? currentProduct.getStockQuantity() : 0;

                switch (tx.getTransactionType()) {
                        case PURCHASE -> {
                                int next = current - qty;
                                if (next < 0) {
                                        throw new NameValueRequiredException(
                                                        "Cannot edit purchase: resulting stock would be negative. Adjust stock first.");
                                }
                                currentProduct.setStockQuantity(next);
                        }
                        case SALE, RETURN_TO_SUPPLIER -> currentProduct.setStockQuantity(current + qty);
                        default -> throw new NameValueRequiredException(
                                        "Unsupported transaction type for edit: " + tx.getTransactionType());
                }
                productRepository.save(currentProduct);
        }

        private void applyTransactionStock(Product product, TransactionType transactionType, Integer quantity) {
                int qty = quantity != null ? quantity : 0;
                int current = product.getStockQuantity() != null ? product.getStockQuantity() : 0;

                switch (transactionType) {
                        case PURCHASE -> product.setStockQuantity(current + qty);
                        case SALE, RETURN_TO_SUPPLIER -> {
                                int next = current - qty;
                                if (next < 0) {
                                        throw new NameValueRequiredException(
                                                        "Cannot apply edit: resulting stock would be negative for the selected product.");
                                }
                                product.setStockQuantity(next);
                        }
                        default -> throw new NameValueRequiredException(
                                        "Unsupported transaction type for edit: " + transactionType);
                }
                productRepository.save(product);
        }

        private BigDecimal calculateTotalPrice(TransactionType transactionType, Product product, Integer quantity) {
                if (transactionType == TransactionType.RETURN_TO_SUPPLIER) {
                        return BigDecimal.ZERO;
                }
                int qty = quantity != null ? quantity : 0;
                return product.getPrice().multiply(BigDecimal.valueOf(qty));
        }


}
