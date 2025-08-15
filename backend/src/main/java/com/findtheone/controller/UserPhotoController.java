package com.findtheone.controller;

import com.findtheone.entity.User;
import com.findtheone.entity.UserPhoto;
import com.findtheone.service.UserPhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserPhotoController {

    @Autowired
    private UserPhotoService userPhotoService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserPhoto>> getUserPhotos(@PathVariable Long userId) {
        List<UserPhoto> photos = userPhotoService.getUserPhotos(userId);
        return ResponseEntity.ok(photos);
    }

    @GetMapping("/my-photos")
    public ResponseEntity<List<UserPhoto>> getMyPhotos(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        List<UserPhoto> photos = userPhotoService.getUserPhotos(user.getId());
        return ResponseEntity.ok(photos);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addPhoto(Authentication authentication, @RequestBody Map<String, String> request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        Long userId = user.getId();

        String photoUrl = request.get("photoUrl");
        String caption = request.get("caption");

        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Photo URL is required"));
        }

        try {
            UserPhoto photo = userPhotoService.addUserPhoto(userId, photoUrl, caption);
            if (photo != null) {
                return ResponseEntity.ok(photo);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to add photo"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/primary/{photoId}")
    public ResponseEntity<?> setPrimaryPhoto(Authentication authentication, @PathVariable Long photoId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        UserPhoto photo = userPhotoService.setPrimaryPhoto(user.getId(), photoId);
        if (photo != null) {
            return ResponseEntity.ok(photo);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to set primary photo"));
        }
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<?> deletePhoto(Authentication authentication, @PathVariable Long photoId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        boolean deleted = userPhotoService.deleteUserPhoto(user.getId(), photoId);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cannot delete photo. You must have at least one photo."));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getPhotoCount(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        long count = userPhotoService.getUserPhotoCount(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }
}
