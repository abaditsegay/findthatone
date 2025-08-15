package com.findtheone.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "likes")
public class Like {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "liker_id", nullable = false)
    private User liker;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "liked_id", nullable = false)
    private User liked;
    
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Column(nullable = false)
    private Boolean isLike = true; // true for like, false for dislike
    
    public Like() {}
    
    public Like(User liker, User liked, Boolean isLike) {
        this.liker = liker;
        this.liked = liked;
        this.isLike = isLike;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getLiker() { return liker; }
    public void setLiker(User liker) { this.liker = liker; }
    
    public User getLiked() { return liked; }
    public void setLiked(User liked) { this.liked = liked; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public Boolean getIsLike() { return isLike; }
    public void setIsLike(Boolean isLike) { this.isLike = isLike; }
}
