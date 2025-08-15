package com.findtheone.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Value("${spring.mail.username:noreply@findtheone.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3001}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail, String name, String verificationCode) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to FindTheOne - Verify Your Email");

            String htmlContent = buildVerificationEmailContent(name, verificationCode);
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendSimpleVerificationEmail(String toEmail, String name, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to FindTheOne - Verify Your Email");

            String content = String.format(
                    "Hello %s,\n\n" +
                            "Welcome to FindTheOne! Please verify your email address to complete your registration.\n\n"
                            +
                            "Your verification code is: %s\n\n" +
                            "This code will expire in 24 hours.\n\n" +
                            "You can verify your email by visiting: %s/verify-email\n\n" +
                            "If you didn't create this account, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "The FindTheOne Team",
                    name, verificationCode, frontendUrl);

            message.setText(content);
            emailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    private String buildVerificationEmailContent(String name, String verificationCode) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Verify Your Email - FindTheOne</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .verification-code { background: #667eea; color: white; padding: 15px 25px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px; margin: 20px 0; letter-spacing: 3px; }
                                .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                                .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>🎯 FindTheOne</h1>
                                <p>Welcome to Your Perfect Match Journey!</p>
                            </div>
                            <div class="content">
                                <h2>Hello %s!</h2>
                                <p>Welcome to FindTheOne! We're excited to have you join our community of people looking for meaningful connections.</p>

                                <p>To complete your registration and start discovering amazing people, please verify your email address using the code below:</p>

                                <div class="verification-code">%s</div>

                                <p>You can also click the button below to go directly to the verification page:</p>
                                <a href="%s/verify-email" class="button">Verify My Email</a>

                                <p><strong>Important:</strong> This verification code will expire in 24 hours for security purposes.</p>

                                <p>If you didn't create this account, please ignore this email and the account will remain unverified.</p>

                                <p>Ready to find your perfect match? We can't wait to see the connections you'll make!</p>
                            </div>
                            <div class="footer">
                                <p>Best regards,<br>The FindTheOne Team</p>
                                <p><small>© 2025 FindTheOne Dating App. All rights reserved.</small></p>
                            </div>
                        </body>
                        </html>
                        """,
                name, verificationCode, frontendUrl);
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to FindTheOne - Your Journey Begins!");

            String htmlContent = buildWelcomeEmailContent(name);
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    private String buildWelcomeEmailContent(String name) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Welcome to FindTheOne</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                                .tips { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                                .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>🎉 Welcome to FindTheOne, %s!</h1>
                                <p>Your email has been verified successfully!</p>
                            </div>
                            <div class="content">
                                <h2>You're all set to start your journey!</h2>
                                <p>Congratulations! Your email has been verified and your account is now active. You can start exploring and connecting with amazing people right away.</p>

                                <a href="%s/dashboard" class="button">Start Discovering Matches</a>

                                <div class="tips">
                                    <h3>💡 Quick Tips to Get Started:</h3>
                                    <ul>
                                        <li><strong>Complete your profile:</strong> Add more photos and details about yourself</li>
                                        <li><strong>Be authentic:</strong> Use recent photos and write genuinely about yourself</li>
                                        <li><strong>Stay active:</strong> Regular activity increases your visibility</li>
                                        <li><strong>Be respectful:</strong> Treat others the way you'd like to be treated</li>
                                    </ul>
                                </div>

                                <p>Need help getting started? Check out our <a href="%s/help">Help Center</a> or reply to this email with any questions.</p>

                                <p>Here's to finding meaningful connections! 💕</p>
                            </div>
                            <div class="footer">
                                <p>Happy matching!<br>The FindTheOne Team</p>
                                <p><small>© 2025 FindTheOne Dating App. All rights reserved.</small></p>
                            </div>
                        </body>
                        </html>
                        """,
                name, frontendUrl, frontendUrl);
    }
}
