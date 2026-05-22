package com.phegondev.InventoryMgtSystem.services;

import com.phegondev.InventoryMgtSystem.models.Warehouse;

import java.util.List;

public interface WarehouseService {

    Warehouse createWarehouse(Warehouse warehouse);

    List<Warehouse> getAllWarehouses();

    Warehouse updateWarehouse(Long id, Warehouse warehouse);

    void deleteWarehouse(Long id);
}