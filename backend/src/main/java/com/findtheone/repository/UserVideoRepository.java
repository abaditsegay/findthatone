package com.findtheone.repository;

import com.findtheone.entity.User;
import com.findtheone.entity.UserVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserVideoRepository extends JpaRepository<UserVideo, Long> {
    
    Optional<UserVideo> findByUserAndIsActiveTrue(User user);
    
    Optional<UserVideo> findByUserId(Long userId);
    
    boolean existsByUserAndIsActiveTrue(User user);
    
    void deleteByUser(User user);
    
    /**
     * Hard delete inactive videos (cleanup method)
     */
    @Modifying
    @Transactional
    void deleteByIsActiveFalse();
}
