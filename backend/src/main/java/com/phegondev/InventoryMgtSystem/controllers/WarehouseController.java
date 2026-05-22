package com.phegondev.InventoryMgtSystem.controllers;

import com.phegondev.InventoryMgtSystem.models.Warehouse;
import com.phegondev.InventoryMgtSystem.services.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping("/add")
    public ResponseEntity<Warehouse> createWarehouse(
            @Valid @RequestBody Warehouse warehouse) {

        return ResponseEntity.ok(
                warehouseService.createWarehouse(warehouse));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {

        return ResponseEntity.ok(
                warehouseService.getAllWarehouses());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(
            @PathVariable Long id,
            @RequestBody Warehouse warehouse) {

        return ResponseEntity.ok(
                warehouseService.updateWarehouse(id, warehouse));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteWarehouse(
            @PathVariable Long id) {

        warehouseService.deleteWarehouse(id);

        return ResponseEntity.ok(
                "Warehouse deleted successfully");
    }
}