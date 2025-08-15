package com.findtheone.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.findtheone.dto.AuthResponse;
import com.findtheone.dto.LoginRequest;
import com.findtheone.dto.RegisterRequest;
import com.findtheone.entity.User;
import com.findtheone.repository.UserRepository;
import com.findtheone.security.JwtUtils;
import com.findtheone.service.EmailVerificationService;
import com.findtheone.service.UserPhotoService;
import com.findtheone.util.LoggingUtils;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserPhotoService userPhotoService;

    @Autowired
    EmailVerificationService emailVerificationService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        
        long startTime = System.currentTimeMillis();
        String clientIp = getClientIpAddress(request);
        
        try {
            LoggingUtils.logSecurityEvent(logger, "LOGIN_ATTEMPT", loginRequest.getEmail(), clientIp, "User attempting to sign in");
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = (User) authentication.getPrincipal();
            
            // Check email verification status
            if (!user.getIsEmailVerified()) {
                long duration = System.currentTimeMillis() - startTime;
                LoggingUtils.logSecurityEvent(logger, "LOGIN_BLOCKED", user.getEmail(), clientIp, "Login blocked - email not verified");
                LoggingUtils.logApiAccess(logger, "/api/auth/signin", "POST", user.getEmail(), 403);
                
                return ResponseEntity.status(403).body(Map.of(
                    "error", "Email verification required",
                    "message", "Please verify your email address before signing in. Check your inbox for the verification code.",
                    "email", user.getEmail(),
                    "requiresVerification", true
                ));
            }
            
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtils.logSecurityEvent(logger, "LOGIN_SUCCESS", user.getEmail(), clientIp, "User successfully authenticated");
            LoggingUtils.logPerformance(logger, "authenticate_user", duration, "Login authentication completed");
            LoggingUtils.logApiAccess(logger, "/api/auth/signin", "POST", user.getEmail(), 200);

            return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getEmail(), user.getName()));
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtils.logSecurityEvent(logger, "LOGIN_FAILURE", loginRequest.getEmail(), clientIp, "Authentication failed: " + e.getMessage());
            LoggingUtils.logError(logger, "authenticate_user", e, "Login attempt failed for email: " + loginRequest.getEmail());
            LoggingUtils.logApiAccess(logger, "/api/auth/signin", "POST", loginRequest.getEmail(), 401);
            throw e;
        }
    }

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Validate that profilePhotoUrl is provided
        if (signUpRequest.getProfilePhotoUrl() == null || signUpRequest.getProfilePhotoUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Profile photo is required!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getName(),
                signUpRequest.getAge(),
                signUpRequest.getGender(),
                signUpRequest.getLocation());

        user.setInterests(signUpRequest.getInterests());
        user.setBio(signUpRequest.getBio());
        user.setProfilePhotoUrl(signUpRequest.getProfilePhotoUrl());

        User savedUser = userRepository.save(user);

        // Automatically create a UserPhoto entry for the uploaded profile picture
        try {
            userPhotoService.addUserPhoto(savedUser.getId(), signUpRequest.getProfilePhotoUrl(), "Profile Picture");
        } catch (Exception e) {
            // Log the error but don't fail registration
            System.err.println("Failed to create UserPhoto during registration: " + e.getMessage());
            e.printStackTrace();
        }

        // Send verification email
        try {
            emailVerificationService.sendVerificationEmail(savedUser);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            // Don't fail registration if email sending fails
        }

        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully! Please check your email for verification instructions.",
                "email", savedUser.getEmail(),
                "requiresVerification", true));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || email.trim().isEmpty() || code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and verification code are required"));
        }

        boolean verified = emailVerificationService.verifyEmail(email, code);

        if (verified) {
            return ResponseEntity.ok(Map.of(
                    "message", "Email verified successfully! You can now sign in.",
                    "verified", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid or expired verification code",
                    "verified", false));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        boolean sent = emailVerificationService.resendVerificationCode(email);

        if (sent) {
            return ResponseEntity.ok(Map.of(
                    "message", "Verification code sent successfully! Please check your email.",
                    "sent", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Unable to send verification code. Email may not exist or already verified.",
                    "sent", false));
        }
    }

    @GetMapping("/verification-status")
    public ResponseEntity<?> getVerificationStatus(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        boolean verified = emailVerificationService.isEmailVerified(email);
        boolean expired = emailVerificationService.isVerificationCodeExpired(email);

        return ResponseEntity.ok(Map.of(
                "email", email,
                "verified", verified,
                "codeExpired", expired));
    }

    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        try {
            // Create a test user for email sending
            User testUser = new User();
            testUser.setEmail(email);
            testUser.setName("Test User");

            emailVerificationService.sendVerificationEmail(testUser);

            return ResponseEntity.ok(Map.of(
                    "message", "Test email sent successfully!",
                    "email", email,
                    "success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to send test email: " + e.getMessage(),
                    "email", email,
                    "success", false));
        }
    }
    
    /**
     * Extract real client IP address considering proxy headers
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
