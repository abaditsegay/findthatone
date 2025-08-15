package com.findtheone.service;

import com.findtheone.entity.User;
import com.findtheone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EmailVerificationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private static final int CODE_LENGTH = 6;
    private static final int CODE_EXPIRY_HOURS = 24;
    private final SecureRandom random = new SecureRandom();

    public String generateVerificationCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    @Transactional
    public void sendVerificationEmail(User user) {
        String verificationCode = generateVerificationCode();
        LocalDateTime expiry = LocalDateTime.now().plusHours(CODE_EXPIRY_HOURS);

        user.setEmailVerificationCode(verificationCode);
        user.setEmailVerificationCodeExpiry(expiry);
        userRepository.save(user);

        try {
            // Try to send HTML email first, fallback to simple text if it fails
            emailService.sendVerificationEmail(user.getEmail(), user.getName(), verificationCode);
        } catch (Exception e) {
            System.err.println("Failed to send HTML email, trying simple email: " + e.getMessage());
            try {
                emailService.sendSimpleVerificationEmail(user.getEmail(), user.getName(), verificationCode);
            } catch (Exception ex) {
                System.err.println("Failed to send verification email: " + ex.getMessage());
                // Don't throw exception to prevent registration failure
                // Log the error but allow registration to continue
            }
        }
    }

    @Transactional
    public boolean verifyEmail(String email, String code) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();

        // Check if already verified
        if (user.getIsEmailVerified()) {
            return true;
        }

        // Check if code matches and is not expired
        if (user.getEmailVerificationCode() != null &&
                user.getEmailVerificationCode().equals(code) &&
                user.getEmailVerificationCodeExpiry() != null &&
                user.getEmailVerificationCodeExpiry().isAfter(LocalDateTime.now())) {

            // Verify the user
            user.setIsEmailVerified(true);
            user.setEmailVerificationCode(null);
            user.setEmailVerificationCodeExpiry(null);
            userRepository.save(user);

            // Send welcome email
            try {
                emailService.sendWelcomeEmail(user.getEmail(), user.getName());
            } catch (Exception e) {
                System.err.println("Failed to send welcome email: " + e.getMessage());
                // Don't fail verification if welcome email fails
            }

            return true;
        }

        return false;
    }

    @Transactional
    public boolean resendVerificationCode(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();

        // Don't resend if already verified
        if (user.getIsEmailVerified()) {
            return false;
        }

        sendVerificationEmail(user);
        return true;
    }

    public boolean isEmailVerified(String email) {
        return userRepository.findByEmail(email)
                .map(User::getIsEmailVerified)
                .orElse(false);
    }

    public boolean isVerificationCodeExpired(String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getEmailVerificationCodeExpiry() == null ||
                        user.getEmailVerificationCodeExpiry().isBefore(LocalDateTime.now()))
                .orElse(true);
    }
}
