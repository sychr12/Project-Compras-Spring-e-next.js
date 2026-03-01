package com.compras.product.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.compras.product.entity.Product;
import com.compras.product.repository.ProductRepository;

@RestController
public class ProductController {

    private final ProductRepository repository;

    @Value("${upload.dir:uploads/}")
    private String uploadDir;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable @NonNull Long id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        if (product.getStock() == null || product.getStock() < 0) {
            product.setStock(0);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable @NonNull Long id, @RequestBody Product updated) {
        return repository.findById(id).map(product -> {
            product.setName(updated.getName());
            product.setDescription(updated.getDescription());
            product.setPrice(updated.getPrice());
            product.setStock(updated.getStock());
            product.setImageUrl(updated.getImageUrl());
            return ResponseEntity.ok(repository.save(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable @NonNull Long id, @RequestBody Map<String, Integer> body) {
        Integer newStock = body.get("stock");
        if (newStock == null || newStock < 0) {
            return ResponseEntity.badRequest().body("Estoque nao pode ser negativo");
        }
        return repository.findById(id).map(product -> {
            product.setStock(newStock);
            return ResponseEntity.ok(repository.save(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable @NonNull Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Arquivo nao pode ser vazio"));
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.matches(".*\\.(jpg|jpeg|png|gif|webp)$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tipo de arquivo nao permitido"));
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String extension = originalName.substring(originalName.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            String fileUrl = "http://localhost:8080/uploads/" + fileName;
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erro ao fazer upload: " + e.getMessage()));
        }
    }
}