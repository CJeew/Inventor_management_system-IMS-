package com.phegondev.InventoryMgtSystem.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "suppliers")
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Column(name = "name")
    private String name;

    @NotBlank(message = " contactInfo is required")
    @Column(name = "contact_info", length = 2000)
    private String contactInfo;

    @Column(name = "address", length = 1000)
    private String address;

    @Column(name = "email", length = 320)
    private String email;

    @Column(name = "phone", length = 64)
    private String phone;

    @Column(name = "company", length = 255)
    private String company;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "goods_supplied", length = 1000)
    private String goodsSupplied;

    @Column(name = "quantity")
    private Integer quantity;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public String getAddress() {
        return address;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getCompany() {
        return company;
    }

    public String getNotes() {
        return notes;
    }

    public String getGoodsSupplied() {
        return goodsSupplied;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setGoodsSupplied(String goodsSupplied) {
        this.goodsSupplied = goodsSupplied;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
