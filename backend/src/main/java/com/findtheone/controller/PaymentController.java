package com.findtheone.controller;

import com.findtheone.entity.Transaction;
import com.findtheone.entity.User;
import com.findtheone.service.CoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @Autowired
    private CoinService coinService;

    @GetMapping("/coins")
    public ResponseEntity<Map<String, Object>> getUserCoins(Authentication authentication) {
        // Temporary fix: use hardcoded user ID 1 when authentication is null
        Long userId = 1L; // Default user ID for testing
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            userId = user.getId();
        }

        Integer coins = coinService.getUserCoins(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("coins", coins);
        response.put("userId", userId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/purchase")
    public ResponseEntity<Map<String, Object>> purchaseCoins(
            Authentication authentication,
            @RequestBody Map<String, Object> purchaseRequest) {

        User user = (User) authentication.getPrincipal();

        // Extract purchase details
        String packageType = (String) purchaseRequest.get("package");

        // Define coin packages
        Map<String, Map<String, Object>> packages = new HashMap<>();
        packages.put("starter", Map.of("coins", 25, "price", new BigDecimal("4.99")));
        packages.put("popular", Map.of("coins", 60, "price", new BigDecimal("9.99")));
        packages.put("premium", Map.of("coins", 150, "price", new BigDecimal("19.99")));
        packages.put("ultimate", Map.of("coins", 350, "price", new BigDecimal("39.99")));

        if (!packages.containsKey(packageType)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid package type"));
        }

        Map<String, Object> selectedPackage = packages.get(packageType);
        Integer coinAmount = (Integer) selectedPackage.get("coins");
        BigDecimal price = (BigDecimal) selectedPackage.get("price");

        try {
            // Simulate fake payment processing
            Thread.sleep(1000); // Simulate payment processing time

            Transaction transaction = coinService.purchaseCoins(user.getId(), coinAmount, price);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Purchase successful!");
            response.put("transaction", Map.of(
                    "id", transaction.getId(),
                    "coinAmount", transaction.getCoinAmount(),
                    "moneyAmount", transaction.getMoneyAmount(),
                    "paymentId", transaction.getPaymentId()));
            response.put("newCoinBalance", coinService.getUserCoins(user.getId()));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Payment processing failed: " + e.getMessage()));
        }
    }

    @GetMapping("/packages")
    public ResponseEntity<Map<String, Object>> getCoinPackages() {
        Map<String, Object> packages = new HashMap<>();

        packages.put("starter", Map.of(
                "coins", 25,
                "price", 4.99,
                "bonus", 0,
                "popular", false));

        packages.put("popular", Map.of(
                "coins", 60,
                "price", 9.99,
                "bonus", 10,
                "popular", true));

        packages.put("premium", Map.of(
                "coins", 150,
                "price", 19.99,
                "bonus", 25,
                "popular", false));

        packages.put("ultimate", Map.of(
                "coins", 350,
                "price", 39.99,
                "bonus", 75,
                "popular", false));

        return ResponseEntity.ok(packages);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getTransactionHistory(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Transaction> transactions = coinService.getUserTransactionHistory(user.getId());
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/unlock-message")
    public ResponseEntity<Map<String, Object>> unlockMessage(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {

        User user = (User) authentication.getPrincipal();
        Long messageId = Long.valueOf(request.get("messageId").toString());

        if (!coinService.canAffordMessage(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Insufficient coins",
                    "coinsNeeded", 1,
                    "currentCoins", coinService.getUserCoins(user.getId())));
        }

        boolean success = coinService.unlockMessage(user.getId(), "Unlocked message #" + messageId);

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message unlocked successfully",
                    "newCoinBalance", coinService.getUserCoins(user.getId())));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to unlock message"));
        }
    }
}
