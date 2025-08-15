package com.findtheone.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private Integer coinAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal moneyAmount; // For purchase transactions

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // For fake payment tracking
    @Column
    private String paymentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.COMPLETED;

    public Transaction() {
    }

    public Transaction(User user, TransactionType type, Integer coinAmount, String description) {
        this.user = user;
        this.type = type;
        this.coinAmount = coinAmount;
        this.description = description;
    }

    public Transaction(User user, TransactionType type, Integer coinAmount, BigDecimal moneyAmount, String description,
            String paymentId) {
        this.user = user;
        this.type = type;
        this.coinAmount = coinAmount;
        this.moneyAmount = moneyAmount;
        this.description = description;
        this.paymentId = paymentId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public Integer getCoinAmount() {
        return coinAmount;
    }

    public void setCoinAmount(Integer coinAmount) {
        this.coinAmount = coinAmount;
    }

    public BigDecimal getMoneyAmount() {
        return moneyAmount;
    }

    public void setMoneyAmount(BigDecimal moneyAmount) {
        this.moneyAmount = moneyAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public enum TransactionType {
        PURCHASE, // Buying coins with money
        SPEND, // Spending coins to read messages
        REFUND, // Refund coins
        BONUS // Free coins/bonuses
    }

    public enum TransactionStatus {
        PENDING,
        COMPLETED,
        FAILED,
        CANCELLED
    }
}
