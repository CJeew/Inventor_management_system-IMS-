package com.phegondev.InventoryMgtSystem.dtos;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.phegondev.InventoryMgtSystem.enums.UserRole;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    //Generic
    private int status;
    private String message;
    //for login
    private String token;
    private UserRole role;
    private String expirationTime;

    //for pagination
    private Integer totalPages;
    private Long totalElements;

    //data output optionals
    private UserDTO user;
    private List<UserDTO> users;

    private SupplierDTO supplier;
    private List<SupplierDTO> suppliers;

    private CategoryDTO category;
    private List<CategoryDTO> categories;

    private ProductDTO product;
    private List<ProductDTO> products;

    private TransactionDTO transaction;
    private List<TransactionDTO> transactions;

    private final LocalDateTime timestamp = LocalDateTime.now();

    public Response() {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Response target = new Response();

        public Builder status(int status) { target.setStatus(status); return this; }
        public Builder message(String message) { target.setMessage(message); return this; }
        public Builder token(String token) { target.setToken(token); return this; }
        public Builder role(UserRole role) { target.setRole(role); return this; }
        public Builder expirationTime(String expirationTime) { target.setExpirationTime(expirationTime); return this; }
        public Builder totalPages(Integer totalPages) { target.setTotalPages(totalPages); return this; }
        public Builder totalElements(Long totalElements) { target.setTotalElements(totalElements); return this; }
        public Builder user(UserDTO user) { target.setUser(user); return this; }
        public Builder users(List<UserDTO> users) { target.setUsers(users); return this; }
        public Builder supplier(SupplierDTO supplier) { target.setSupplier(supplier); return this; }
        public Builder suppliers(List<SupplierDTO> suppliers) { target.setSuppliers(suppliers); return this; }
        public Builder category(CategoryDTO category) { target.setCategory(category); return this; }
        public Builder categories(List<CategoryDTO> categories) { target.setCategories(categories); return this; }
        public Builder product(ProductDTO product) { target.setProduct(product); return this; }
        public Builder products(List<ProductDTO> products) { target.setProducts(products); return this; }
        public Builder transaction(TransactionDTO transaction) { target.setTransaction(transaction); return this; }
        public Builder transactions(List<TransactionDTO> transactions) { target.setTransactions(transactions); return this; }

        public Response build() { return target; }
    }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public String getExpirationTime() { return expirationTime; }
    public void setExpirationTime(String expirationTime) { this.expirationTime = expirationTime; }
    public Integer getTotalPages() { return totalPages; }
    public void setTotalPages(Integer totalPages) { this.totalPages = totalPages; }
    public Long getTotalElements() { return totalElements; }
    public void setTotalElements(Long totalElements) { this.totalElements = totalElements; }
    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }
    public List<UserDTO> getUsers() { return users; }
    public void setUsers(List<UserDTO> users) { this.users = users; }
    public SupplierDTO getSupplier() { return supplier; }
    public void setSupplier(SupplierDTO supplier) { this.supplier = supplier; }
    public List<SupplierDTO> getSuppliers() { return suppliers; }
    public void setSuppliers(List<SupplierDTO> suppliers) { this.suppliers = suppliers; }
    public CategoryDTO getCategory() { return category; }
    public void setCategory(CategoryDTO category) { this.category = category; }
    public List<CategoryDTO> getCategories() { return categories; }
    public void setCategories(List<CategoryDTO> categories) { this.categories = categories; }
    public ProductDTO getProduct() { return product; }
    public void setProduct(ProductDTO product) { this.product = product; }
    public List<ProductDTO> getProducts() { return products; }
    public void setProducts(List<ProductDTO> products) { this.products = products; }
    public TransactionDTO getTransaction() { return transaction; }
    public void setTransaction(TransactionDTO transaction) { this.transaction = transaction; }
    public List<TransactionDTO> getTransactions() { return transactions; }
    public void setTransactions(List<TransactionDTO> transactions) { this.transactions = transactions; }
    public LocalDateTime getTimestamp() { return timestamp; }

}
