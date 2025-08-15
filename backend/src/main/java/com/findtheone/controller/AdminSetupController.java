package com.findtheone.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.findtheone.entity.Role;
import com.findtheone.entity.User;
import com.findtheone.entity.VideoVerificationStatus;
import com.findtheone.repository.UserRepository;

@RestController
@RequestMapping("/api/setup")
public class AdminSetupController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create-admin")
    public ResponseEntity<?> createSystemAdmin() {
        try {
            // Check if admin already exists
            if (userRepository.existsByRole(Role.ADMIN)) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "System admin already exists"
                ));
            }

            // Create admin user
            User admin = new User();
            admin.setEmail("admin@findtheone.com");
            admin.setPassword(passwordEncoder.encode("Admin2025!@#"));
            admin.setName("System Administrator");
            admin.setAge(30);
            admin.setGender(User.Gender.OTHER);
            admin.setLocation("System Location");
            admin.setInterests("System Administration, User Management, Application Security");
            admin.setBio("System Administrator with full access to manage the FindTheOne application, users, and configurations.");
            admin.setRole(Role.ADMIN);
            admin.setIsActive(true);
            admin.setIsEmailVerified(true);
            admin.setIsVideoVerified(true);
            admin.setVideoVerificationStatus(VideoVerificationStatus.APPROVED);
            admin.setVideoVerifiedAt(LocalDateTime.now());
            admin.setCoins(1000);
            admin.setProfilePhotoUrl("/avatars/admin-avatar.svg");
            
            User savedAdmin = userRepository.save(admin);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "System admin created successfully",
                "adminId", savedAdmin.getId(),
                "email", "admin@findtheone.com",
                "tempPassword", "Admin2025!@#",
                "note", "Please change the password after first login"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error creating system admin: " + e.getMessage()
            ));
        }
    }
}
