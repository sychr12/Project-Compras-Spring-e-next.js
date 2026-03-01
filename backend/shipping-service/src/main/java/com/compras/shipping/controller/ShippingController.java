package com.compras.shipping.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.compras.shipping.entity.Shipment;
import com.compras.shipping.repository.ShipmentRepository;

@RestController
@RequestMapping("/shipping")
public class ShippingController {

    private final ShipmentRepository repository;

    public ShippingController(ShipmentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<?> createShipment(@RequestBody Map<String, Object> body) {
        if (body.get("orderId") == null) {
            return ResponseEntity.badRequest().body("Campo orderId e obrigatorio");
        }

        Long orderId;
        try {
            orderId = Long.valueOf(body.get("orderId").toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("orderId deve ser um numero valido");
        }

        if (repository.findByOrderId(orderId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Ja existe um envio para o pedido " + orderId);
        }

        Shipment shipment = new Shipment();
        shipment.setOrderId(orderId);
        shipment.setStatus("PREPARING");
        shipment.setTrackingCode("BR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(shipment));
    }

    @GetMapping
    public ResponseEntity<List<Shipment>> getAllShipments() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Shipment> getByOrderId(@PathVariable @NonNull Long orderId) {
        return repository.findByOrderId(orderId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable @NonNull Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body("Campo status e obrigatorio");
        }

        return repository.findById(id).map(shipment -> {
            shipment.setStatus(newStatus);
            return ResponseEntity.ok(repository.save(shipment));
        }).orElse(ResponseEntity.notFound().build());
    }
}