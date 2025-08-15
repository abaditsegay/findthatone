package com.findtheone.dto;

import com.findtheone.entity.User;

public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private Integer age;
    private User.Gender gender;
    private String location;
    private String interests;
    private String bio;
    private String profilePhotoUrl;
    private Integer coins;

    public UserResponse() {
    }

    public UserResponse(Long id, String email, String name, Integer age, User.Gender gender,
            String location, String interests, String bio, String profilePhotoUrl, Integer coins) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.location = location;
        this.interests = interests;
        this.bio = bio;
        this.profilePhotoUrl = profilePhotoUrl;
        this.coins = coins;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public User.Gender getGender() {
        return gender;
    }

    public void setGender(User.Gender gender) {
        this.gender = gender;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public Integer getCoins() {
        return coins;
    }

    public void setCoins(Integer coins) {
        this.coins = coins;
    }
}
