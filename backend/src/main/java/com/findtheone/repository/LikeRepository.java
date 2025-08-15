package com.findtheone.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.findtheone.entity.Like;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    Optional<Like> findByLikerIdAndLikedId(Long likerId, Long likedId);
    
    boolean existsByLikerIdAndLikedId(Long likerId, Long likedId);
    
    @Query("SELECT COUNT(l) > 0 FROM Like l WHERE " +
           "(l.liker.id = :user1Id AND l.liked.id = :user2Id AND l.isLike = true) AND " +
           "(EXISTS (SELECT l2 FROM Like l2 WHERE l2.liker.id = :user2Id AND l2.liked.id = :user1Id AND l2.isLike = true))")
    boolean isMatch(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.liker.id = :userId AND l.isLike = true")
    Long countLikesGivenByUser(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.liked.id = :userId AND l.isLike = true")
    Long countLikesReceivedByUser(@Param("userId") Long userId);
}
