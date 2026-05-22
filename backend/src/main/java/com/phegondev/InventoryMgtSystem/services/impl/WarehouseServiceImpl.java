package com.phegondev.InventoryMgtSystem.services.impl;

import com.phegondev.InventoryMgtSystem.models.Warehouse;
import com.phegondev.InventoryMgtSystem.repositories.WarehouseRepository;
import com.phegondev.InventoryMgtSystem.services.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Override
    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    @Override
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @Override
    public Warehouse updateWarehouse(Long id, Warehouse warehouse) {

        Warehouse existingWarehouse =
                warehouseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Warehouse not found"));

        existingWarehouse.setWarehouseName(
                warehouse.getWarehouseName());

        existingWarehouse.setWarehouseCode(
                warehouse.getWarehouseCode());

        existingWarehouse.setAddress(
                warehouse.getAddress());

        existingWarehouse.setCity(
                warehouse.getCity());

        existingWarehouse.setManagerName(
                warehouse.getManagerName());

        existingWarehouse.setContactNumber(
                warehouse.getContactNumber());

        existingWarehouse.setLocations(
                warehouse.getLocations());

        existingWarehouse.setActive(
                warehouse.getActive());

        return warehouseRepository.save(existingWarehouse);
    }

    @Override
    public void deleteWarehouse(Long id) {

        Warehouse warehouse =
                warehouseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Warehouse not found"));

        warehouseRepository.delete(warehouse);
    }
}