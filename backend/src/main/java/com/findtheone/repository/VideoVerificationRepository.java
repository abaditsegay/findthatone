package com.findtheone.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.findtheone.entity.VideoVerification;
import com.findtheone.entity.VideoVerification.VerificationStatus;

@Repository
public interface VideoVerificationRepository extends JpaRepository<VideoVerification, Long> {

    List<VideoVerification> findByUserIdAndIsActiveTrue(Long userId);

    List<VideoVerification> findByStatusAndIsActiveTrue(VerificationStatus status);

    @Query("SELECT v FROM VideoVerification v WHERE v.user.id = :userId AND v.isActive = true ORDER BY v.submittedAt DESC")
    List<VideoVerification> findActiveByUserIdOrderBySubmittedAtDesc(@Param("userId") Long userId);

    @Query("SELECT v FROM VideoVerification v WHERE v.status = :status AND v.isActive = true ORDER BY v.submittedAt ASC")
    List<VideoVerification> findByStatusOrderBySubmittedAtAsc(@Param("status") VerificationStatus status);

    Optional<VideoVerification> findTopByUserIdAndIsActiveTrueOrderBySubmittedAtDesc(Long userId);

    boolean existsByUserIdAndStatusAndIsActiveTrue(Long userId, VerificationStatus status);
}
