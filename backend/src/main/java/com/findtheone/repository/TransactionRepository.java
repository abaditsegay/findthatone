package com.findtheone.repository;

import com.findtheone.entity.Transaction;
import com.findtheone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserOrderByCreatedAtDesc(User user);

    List<Transaction> findByUserAndTypeOrderByCreatedAtDesc(User user, Transaction.TransactionType type);

    @Query("SELECT SUM(t.coinAmount) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.status = 'COMPLETED'")
    Integer sumCoinAmountByUserAndType(@Param("user") User user, @Param("type") Transaction.TransactionType type);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.type = 'PURCHASE' AND t.status = 'COMPLETED' ORDER BY t.createdAt DESC")
    List<Transaction> findCompletedPurchasesByUser(@Param("user") User user);
}
