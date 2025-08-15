package com.findtheone.controller;

import com.findtheone.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-email")
    public ResponseEntity<String> testEmail(@RequestParam String email) {
        try {
            emailService.sendSimpleVerificationEmail(email, "Test User", "123456");
            return ResponseEntity.ok("Email sent successfully to " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }
}
