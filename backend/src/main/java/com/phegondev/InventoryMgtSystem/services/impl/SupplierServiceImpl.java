package com.phegondev.InventoryMgtSystem.services.impl;


import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.dtos.SupplierDTO;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Supplier;
import com.phegondev.InventoryMgtSystem.repositories.SupplierRepository;
import com.phegondev.InventoryMgtSystem.services.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierServiceImpl implements SupplierService {


    private final SupplierRepository supplierRepository;

    /** Explicit mapping avoids ModelMapper gaps with the {@link Supplier} entity shape. */
    private static SupplierDTO copyToDto(Supplier s) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setContactInfo(s.getContactInfo());
        dto.setAddress(s.getAddress());
        dto.setEmail(s.getEmail());
        dto.setPhone(s.getPhone());
        dto.setCompany(s.getCompany());
        dto.setNotes(s.getNotes());
        dto.setGoodsSupplied(s.getGoodsSupplied());
        dto.setQuantity(s.getQuantity());
        return dto;
    }


    @Override
    @Transactional
    public Response addSupplier(SupplierDTO supplierDTO) {

        Supplier supplierToSave = new Supplier();
        supplierToSave.setName(supplierDTO.getName());
        supplierToSave.setContactInfo(supplierDTO.getContactInfo());
        supplierToSave.setAddress(supplierDTO.getAddress());
        supplierToSave.setEmail(supplierDTO.getEmail());
        supplierToSave.setPhone(supplierDTO.getPhone());
        supplierToSave.setCompany(supplierDTO.getCompany());
        supplierToSave.setNotes(supplierDTO.getNotes());
        supplierToSave.setGoodsSupplied(supplierDTO.getGoodsSupplied());
        supplierToSave.setQuantity(supplierDTO.getQuantity());

        supplierRepository.save(supplierToSave);

        return Response.builder()
                .status(200)
                .message("Supplier Saved Successfully")
                .build();
    }

    @Override
    @Transactional
    public Response updateSupplier(Long id, SupplierDTO supplierDTO) {

        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Supplier Not Found"));

        // Full replace from the request body so optional fields (email, phone, etc.) always persist
        // and can be cleared with null — matches the add/edit form payload.
        existingSupplier.setName(supplierDTO.getName());
        existingSupplier.setContactInfo(supplierDTO.getContactInfo());
        existingSupplier.setAddress(supplierDTO.getAddress());
        existingSupplier.setEmail(supplierDTO.getEmail());
        existingSupplier.setPhone(supplierDTO.getPhone());
        existingSupplier.setCompany(supplierDTO.getCompany());
        existingSupplier.setNotes(supplierDTO.getNotes());
        existingSupplier.setGoodsSupplied(supplierDTO.getGoodsSupplied());
        existingSupplier.setQuantity(supplierDTO.getQuantity());

        Supplier saved = supplierRepository.save(existingSupplier);
        SupplierDTO updatedDto = copyToDto(saved);

        return Response.builder()
                .status(200)
                .message("Supplier Was Successfully Updated")
                .supplier(updatedDto)
                .build();
    }

    @Override
    public Response getAllSupplier() {

        List<Supplier> suppliers = supplierRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        List<SupplierDTO> supplierDTOList = suppliers.stream().map(SupplierServiceImpl::copyToDto).collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .message("success")
                .suppliers(supplierDTOList)
                .build();
    }

    @Override
    public Response getSupplierById(Long id) {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Supplier Not Found"));

        SupplierDTO supplierDTO = copyToDto(supplier);

        return Response.builder()
                .status(200)
                .message("success")
                .supplier(supplierDTO)
                .build();
    }

    @Override
    public Response deleteSupplier(Long id) {

        supplierRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Supplier Not Found"));

        supplierRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Supplier Was Successfully Deleted")
                .build();
    }
}
