package com.findtheone.dto;

import java.math.BigDecimal;

public class PurchaseRequest {
    private String packageType;
    private Integer coinAmount;
    private BigDecimal amount;

    public PurchaseRequest() {
    }

    public PurchaseRequest(String packageType, Integer coinAmount, BigDecimal amount) {
        this.packageType = packageType;
        this.coinAmount = coinAmount;
        this.amount = amount;
    }

    // Getters and Setters
    public String getPackageType() {
        return packageType;
    }

    public void setPackageType(String packageType) {
        this.packageType = packageType;
    }

    public Integer getCoinAmount() {
        return coinAmount;
    }

    public void setCoinAmount(Integer coinAmount) {
        this.coinAmount = coinAmount;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
