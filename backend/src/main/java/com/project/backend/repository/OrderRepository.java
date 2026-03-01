package com.project.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.backend.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}