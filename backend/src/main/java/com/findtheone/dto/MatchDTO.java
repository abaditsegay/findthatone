package com.findtheone.dto;

import java.time.LocalDateTime;

public class MatchDTO {
    private Long matchId;  // The actual match record ID
    private Long userId;   // The matched user's ID
    private String name;
    private Integer age;
    private String bio;
    private String location;
    private String profilePhotoUrl;
    private String gender;
    private String interests;
    private LocalDateTime matchedAt;

    public MatchDTO() {
    }

    public MatchDTO(Long matchId, Long userId, String name, Integer age, String bio, String location,
            String profilePhotoUrl, String gender, String interests, LocalDateTime matchedAt) {
        this.matchId = matchId;
        this.userId = userId;
        this.name = name;
        this.age = age;
        this.bio = bio;
        this.location = location;
        this.profilePhotoUrl = profilePhotoUrl;
        this.gender = gender;
        this.interests = interests;
        this.matchedAt = matchedAt;
    }

    // Getters and Setters
    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public LocalDateTime getMatchedAt() {
        return matchedAt;
    }

    public void setMatchedAt(LocalDateTime matchedAt) {
        this.matchedAt = matchedAt;
    }
}
