package com.phegondev.InventoryMgtSystem.dtos;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
/** Always emit every field so nested lists are not affected by {@link Response}'s NON_NULL inclusion. */
@JsonInclude(JsonInclude.Include.ALWAYS)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SupplierDTO {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = " contactInfo is required")
    @JsonAlias({ "contact_info", "ContactInfo" })
    private String contactInfo;

    private String address;

    @JsonProperty("email")
    @JsonAlias({ "Email", "supplierEmail", "businessEmail" })
    private String email;

    @JsonAlias({ "phone_number", "Phone", "mobile" })
    private String phone;

    @JsonAlias({ "company_name", "Company" })
    private String company;

    private String notes;

    @JsonAlias({ "goods_supplied", "GoodsSupplied" })
    private String goodsSupplied;

    private Integer quantity;
}
