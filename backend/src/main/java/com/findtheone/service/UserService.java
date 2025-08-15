package com.findtheone.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.findtheone.dto.UserResponse;
import com.findtheone.entity.User;
import com.findtheone.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserResponse> getPotentialMatches(Long userId) {
        List<User> users = userRepository.findPotentialMatches(userId);
        return users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getPotentialMatchesByLocation(Long userId, String location) {
        List<User> users = userRepository.findPotentialMatchesByLocation(userId, location);
        return users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    public Optional<UserResponse> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToUserResponse);
    }

    public User updateUser(Long userId, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(userId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(updatedUser.getName());
            user.setAge(updatedUser.getAge());
            user.setLocation(updatedUser.getLocation());
            user.setInterests(updatedUser.getInterests());
            user.setBio(updatedUser.getBio());
            user.setProfilePhotoUrl(updatedUser.getProfilePhotoUrl());
            return userRepository.save(user);
        }
        return null;
    }

    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getAge(),
                user.getGender(),
                user.getLocation(),
                user.getInterests(),
                user.getBio(),
                user.getProfilePhotoUrl(),
                user.getCoins());
    }

    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
}
