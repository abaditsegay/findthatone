package com.findtheone.repository;

import com.findtheone.entity.UserPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPhotoRepository extends JpaRepository<UserPhoto, Long> {

    @Query("SELECT up FROM UserPhoto up WHERE up.user.id = :userId AND up.isActive = true ORDER BY up.photoOrder ASC")
    List<UserPhoto> findActivePhotosByUserId(@Param("userId") Long userId);

    @Query("SELECT up FROM UserPhoto up WHERE up.user.id = :userId AND up.photoOrder = 1 AND up.isActive = true")
    Optional<UserPhoto> findPrimaryPhotoByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(up) FROM UserPhoto up WHERE up.user.id = :userId AND up.isActive = true")
    Long countActivePhotosByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(up.photoOrder) FROM UserPhoto up WHERE up.user.id = :userId AND up.isActive = true")
    Optional<Integer> findMaxPhotoOrderByUserId(@Param("userId") Long userId);
}
