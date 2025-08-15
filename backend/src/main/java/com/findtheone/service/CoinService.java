package com.findtheone.service;

import com.findtheone.entity.Transaction;
import com.findtheone.entity.User;
import com.findtheone.repository.TransactionRepository;
import com.findtheone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CoinService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public Integer getUserCoins(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(User::getCoins).orElse(0);
    }

    @Transactional
    public boolean spendCoins(Long userId, Integer amount, String description) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        if (user.getCoins() < amount) {
            return false; // Insufficient coins
        }

        // Deduct coins
        user.setCoins(user.getCoins() - amount);
        userRepository.save(user);

        // Record transaction
        Transaction transaction = new Transaction(
                user,
                Transaction.TransactionType.SPEND,
                -amount,
                description);
        transactionRepository.save(transaction);

        return true;
    }

    @Transactional
    public Transaction purchaseCoins(Long userId, Integer coinAmount, BigDecimal moneyAmount) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        // Simulate fake payment processing
        String paymentId = "FAKE_PAY_" + UUID.randomUUID().toString().substring(0, 8);

        // Add coins to user
        user.setCoins(user.getCoins() + coinAmount);
        userRepository.save(user);

        // Record transaction
        Transaction transaction = new Transaction(
                user,
                Transaction.TransactionType.PURCHASE,
                coinAmount,
                moneyAmount,
                "Purchased " + coinAmount + " coins",
                paymentId);

        return transactionRepository.save(transaction);
    }

    @Transactional
    public void addBonusCoins(Long userId, Integer amount, String description) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        user.setCoins(user.getCoins() + amount);
        userRepository.save(user);

        // Record transaction
        Transaction transaction = new Transaction(
                user,
                Transaction.TransactionType.BONUS,
                amount,
                description);
        transactionRepository.save(transaction);
    }

    public List<Transaction> getUserTransactionHistory(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }

        return transactionRepository.findByUserOrderByCreatedAtDesc(userOpt.get());
    }

    public boolean canAffordMessage(Long userId) {
        return getUserCoins(userId) >= 1; // 1 coin per message
    }

    @Transactional
    public boolean unlockMessage(Long userId, String description) {
        return spendCoins(userId, 1, description); // 1 coin per message
    }
}
