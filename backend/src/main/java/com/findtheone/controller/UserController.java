package com.findtheone.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.findtheone.dto.UserResponse;
import com.findtheone.entity.User;
import com.findtheone.service.UserService;
import com.findtheone.service.StatisticsService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/debug")
    public ResponseEntity<?> debugCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "profilePhotoUrl", user.getProfilePhotoUrl(),
                "authPrincipal", "User object found"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        Optional<UserResponse> userResponse = userService.getUserById(user.getId());

        if (userResponse.isPresent()) {
            UserResponse response = userResponse.get();
            // If no profile photo URL is set, set a default one
            if (response.getProfilePhotoUrl() == null || response.getProfilePhotoUrl().trim().isEmpty()) {
                response.setProfilePhotoUrl("/avatars/avatar1.svg");
                // Also update the database
                User userEntity = (User) authentication.getPrincipal();
                userEntity.setProfilePhotoUrl("/avatars/avatar1.svg");
                userService.updateUser(userEntity.getId(), userEntity);
            }
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        Map<String, Object> stats = statisticsService.getUserStatistics(user.getId());
        
        // Add email verification status
        stats.put("isEmailVerified", user.getIsEmailVerified());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/matches")
    public ResponseEntity<List<UserResponse>> getPotentialMatches(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(null);
        }

        User user = (User) authentication.getPrincipal();
        List<UserResponse> matches = userService.getPotentialMatches(user.getId());
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/matches/location/{location}")
    public ResponseEntity<List<UserResponse>> getPotentialMatchesByLocation(
            Authentication authentication,
            @PathVariable String location) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(null);
        }

        User user = (User) authentication.getPrincipal();
        List<UserResponse> matches = userService.getPotentialMatchesByLocation(user.getId(), location);
        return ResponseEntity.ok(matches);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody User updatedUser) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        User updated = userService.updateUser(user.getId(), updatedUser);

        if (updated != null) {
            return ResponseEntity.ok("Profile updated successfully!");
        } else {
            return ResponseEntity.badRequest().body("Failed to update profile");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<UserResponse> userResponse = userService.getUserById(id);

        if (userResponse.isPresent()) {
            return ResponseEntity.ok(userResponse.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/profile-picture")
    public ResponseEntity<?> updateProfilePicture(Authentication authentication,
            @RequestBody Map<String, String> request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        String photoUrl = request.get("photoUrl");
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Photo URL is required"));
        }

        Optional<User> userOptional = userService.findById(user.getId());
        if (userOptional.isPresent()) {
            User userToUpdate = userOptional.get();
            userToUpdate.setProfilePhotoUrl(photoUrl);
            User updatedUser = userService.saveUser(userToUpdate);
            return ResponseEntity.ok(Map.of(
                    "message", "Profile picture updated successfully",
                    "profilePhotoUrl", updatedUser.getProfilePhotoUrl()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
