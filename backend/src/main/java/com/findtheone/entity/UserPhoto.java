package com.findtheone.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_photos")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class UserPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String photoUrl;

    @Column(nullable = false)
    private Integer photoOrder = 1; // Order of photos (1 = primary)

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    private String caption;

    public UserPhoto() {
    }

    public UserPhoto(User user, String photoUrl, Integer photoOrder) {
        this.user = user;
        this.photoUrl = photoUrl;
        this.photoOrder = photoOrder;
    }

    public UserPhoto(User user, String photoUrl, Integer photoOrder, String caption) {
        this.user = user;
        this.photoUrl = photoUrl;
        this.photoOrder = photoOrder;
        this.caption = caption;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public Integer getPhotoOrder() {
        return photoOrder;
    }

    public void setPhotoOrder(Integer photoOrder) {
        this.photoOrder = photoOrder;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }
}
