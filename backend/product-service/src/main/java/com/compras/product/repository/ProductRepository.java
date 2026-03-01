package com.compras.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.compras.product.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
