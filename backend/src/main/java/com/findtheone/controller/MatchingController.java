package com.findtheone.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.findtheone.dto.MatchDTO;
import com.findtheone.entity.Match;
import com.findtheone.entity.User;
import com.findtheone.service.MatchingService;

@RestController
@RequestMapping("/api/matching")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MatchingController {

    @Autowired
    private MatchingService matchingService;

    @PostMapping("/like/{likedUserId}")
    public ResponseEntity<?> likeUser(Authentication authentication, @PathVariable Long likedUserId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        boolean isMatch = matchingService.likeUser(user.getId(), likedUserId);

        if (isMatch) {
            return ResponseEntity.ok(Map.of("message", "It's a match!", "isMatch", true));
        } else {
            return ResponseEntity.ok(Map.of("message", "Like sent", "isMatch", false));
        }
    }

    @PostMapping("/dislike/{dislikedUserId}")
    public ResponseEntity<?> dislikeUser(Authentication authentication, @PathVariable Long dislikedUserId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        matchingService.dislikeUser(user.getId(), dislikedUserId);
        return ResponseEntity.ok(Map.of("message", "Dislike recorded"));
    }

    @GetMapping("/matches")
    public ResponseEntity<List<MatchDTO>> getUserMatches(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(null);
        }

        User user = (User) authentication.getPrincipal();
        List<MatchDTO> matches = matchingService.getUserMatchDTOs(user.getId());
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<User>> getUserSuggestions(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(null);
        }

        User user = (User) authentication.getPrincipal();
        List<User> suggestions = matchingService.getUserSuggestions(user.getId());
        return ResponseEntity.ok(suggestions);
    }
}
