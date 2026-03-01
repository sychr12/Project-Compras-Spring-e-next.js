package com.compras.order.dto;

import java.math.BigDecimal;
import java.util.List;

public class OrderRequest {

    private List<ItemRequest> items;
    private BigDecimal total;
    private String status;

    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static class ItemRequest {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }
}
