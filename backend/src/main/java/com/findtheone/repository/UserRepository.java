package com.findtheone.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.findtheone.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

       Optional<User> findByEmail(String email);

       boolean existsByEmail(String email);

       @Query("SELECT u FROM User u WHERE u.id != :userId AND u.isActive = true " +
                     "AND u.id NOT IN (SELECT l.liked.id FROM Like l WHERE l.liker.id = :userId)")
       List<User> findPotentialMatches(@Param("userId") Long userId);

       @Query("SELECT u FROM User u WHERE u.id != :userId AND u.location = :location " +
                     "AND u.isActive = true AND u.id NOT IN (SELECT l.liked.id FROM Like l WHERE l.liker.id = :userId)")
       List<User> findPotentialMatchesByLocation(@Param("userId") Long userId, @Param("location") String location);
}
