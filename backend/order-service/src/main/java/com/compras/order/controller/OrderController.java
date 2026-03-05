package com.compras.order.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.compras.order.dto.OrderRequest;
import com.compras.order.entity.Order;
import com.compras.order.entity.OrderItem;
import com.compras.order.repository.OrderRepository;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Value("${product.service.url}")
    private String productServiceUrl;

    @Value("${shipping.service.url}")
    private String shippingServiceUrl;

    public OrderController(OrderRepository orderRepository, RestTemplate restTemplate) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Pedido deve ter ao menos um item");
        }

        // Valida estoque de todos os itens antes de alterar qualquer coisa
        for (OrderRequest.ItemRequest itemReq : request.getItems()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> product = restTemplate.getForObject(
                    productServiceUrl + "/products/" + itemReq.getProductId(), Map.class);
                if (product == null) {
                    return ResponseEntity.badRequest().body("Produto nao encontrado: " + itemReq.getProductId());
                }
                int currentStock = ((Number) product.get("stock")).intValue();
                if (currentStock < itemReq.getQuantity()) {
                    return ResponseEntity.badRequest().body("Estoque insuficiente para: " + product.get("name"));
                }
            } catch (RestClientException e) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Servico de produtos indisponivel: " + e.getMessage());
            }
        }

        // Decrementa estoque usando exchange com HttpMethod.PATCH (RestTemplate nao suporta patchForObject nativamente)
        for (OrderRequest.ItemRequest itemReq : request.getItems()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> product = restTemplate.getForObject(
                    productServiceUrl + "/products/" + itemReq.getProductId(), Map.class);
                if (product != null) {
                    int currentStock = ((Number) product.get("stock")).intValue();
                    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(
                        Map.of("stock", currentStock - itemReq.getQuantity()));
                    restTemplate.exchange(
                        productServiceUrl + "/products/" + itemReq.getProductId() + "/stock",
                        HttpMethod.PATCH, entity, Map.class);
                }
            } catch (RestClientException e) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Erro ao atualizar estoque: " + e.getMessage());
            }
        }

        Order order = new Order();
        order.setTotal(request.getTotal());
        order.setStatus("PENDING");

        List<OrderItem> items = new ArrayList<>();
        for (OrderRequest.ItemRequest itemReq : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId(itemReq.getProductId());
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(itemReq.getPrice());
            item.setOrder(order);
            items.add(item);
        }

        order.setItems(items);
        Order saved = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body("Campo 'status' e obrigatorio");
        }

        return orderRepository.findById(id).map(order -> {
            order.setStatus(newStatus);
            Order saved = orderRepository.save(order);

            if ("CONFIRMED".equals(newStatus)) {
                try {
                    restTemplate.postForObject(
                        shippingServiceUrl + "/shipping",
                        Map.of("orderId", id, "status", "PREPARING"), Map.class);
                } catch (RestClientException ignored) {}
            }

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}