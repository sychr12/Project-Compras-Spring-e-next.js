package com.project.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.backend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}