package com.findtheone.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class OAuth2EmailService {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2EmailService.class);

    @Value("${OAUTH2_CLIENT_ID:}")
    private String clientId;

    @Value("${OAUTH2_CLIENT_SECRET:}")
    private String clientSecret;

    @Value("${OAUTH2_TENANT_ID:}")
    private String tenantId;

    @Value("${spring.mail.username:noreply@findtheone.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isOAuth2Available() {
        return clientId != null && !clientId.trim().isEmpty() &&
               clientSecret != null && !clientSecret.trim().isEmpty() &&
               tenantId != null && !tenantId.trim().isEmpty();
    }

    private String getAccessToken() {
        try {
            String tokenUrl = String.format("https://login.microsoftonline.com/%s/oauth2/v2.0/token", tenantId);
            
            logger.info("OAuth2 Token Request - URL: {}", tokenUrl);
            logger.info("OAuth2 Token Request - Client ID: {}", clientId);
            logger.info("OAuth2 Token Request - Tenant ID: {}", tenantId);
            logger.info("OAuth2 Token Request - Client Secret Length: {}", clientSecret != null ? clientSecret.length() : "null");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("scope", "https://graph.microsoft.com/.default");
            body.add("grant_type", "client_credentials");
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                ObjectNode jsonResponse = objectMapper.readValue(response.getBody(), ObjectNode.class);
                return jsonResponse.get("access_token").asText();
            } else {
                throw new RuntimeException("Failed to get access token: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Failed to get OAuth2 access token", e);
            throw new RuntimeException("Failed to get access token", e);
        }
    }

    private void sendEmail(String toEmail, String subject, String body, boolean isHtml) {
        try {
            String accessToken = getAccessToken();
            String graphUrl = String.format("https://graph.microsoft.com/v1.0/users/%s/sendMail", fromEmail);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            
            ObjectNode emailRequest = objectMapper.createObjectNode();
            ObjectNode message = objectMapper.createObjectNode();
            
            message.put("subject", subject);
            
            // Add sender information
            ObjectNode fromNode = objectMapper.createObjectNode();
            ObjectNode fromEmailAddress = objectMapper.createObjectNode();
            fromEmailAddress.put("address", fromEmail);
            fromEmailAddress.put("name", "FindTheOne Support");
            fromNode.set("emailAddress", fromEmailAddress);
            message.set("from", fromNode);
            
            ObjectNode bodyNode = objectMapper.createObjectNode();
            bodyNode.put("contentType", isHtml ? "HTML" : "Text");
            bodyNode.put("content", body);
            message.set("body", bodyNode);
            
            ObjectNode toRecipients = objectMapper.createObjectNode();
            ObjectNode emailAddress = objectMapper.createObjectNode();
            emailAddress.put("address", toEmail);
            toRecipients.set("emailAddress", emailAddress);
            message.set("toRecipients", objectMapper.createArrayNode().add(toRecipients));
            
            // Add importance and delivery receipt settings
            message.put("importance", "normal");
            message.put("isDeliveryReceiptRequested", false);
            message.put("isReadReceiptRequested", false);
            
            emailRequest.set("message", message);
            emailRequest.put("saveToSentItems", true);
            
            HttpEntity<String> request = new HttpEntity<>(emailRequest.toString(), headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(graphUrl, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Email sent successfully to: {}", toEmail);
            } else {
                logger.error("Failed to send email: {}", response.getStatusCode());
                throw new RuntimeException("Failed to send email: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Failed to send email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendVerificationEmail(String toEmail, String name, String verificationCode) {
        logger.info("Sending verification email to: {} with code: {}", toEmail, verificationCode);
        String subject = "FindTheOne Email Verification";
        String body = buildSimpleVerificationEmailContent(name, verificationCode);
        sendEmail(toEmail, subject, body, true);
    }

    public void sendSimpleVerificationEmail(String toEmail, String name, String verificationCode) {
        logger.info("Sending simple verification email to: {} with code: {}", toEmail, verificationCode);
        String subject = "FindTheOne Email Verification";
        String body = buildSimpleVerificationEmailContent(name, verificationCode);
        sendEmail(toEmail, subject, body, true); // Changed to true to send HTML
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        logger.info("Sending welcome email to: {}", toEmail);
        String subject = "Welcome to FindTheOne - Your Journey Begins!";
        String body = buildWelcomeEmailContent(name);
        sendEmail(toEmail, subject, body, true);
    }

    private String buildSimpleVerificationEmailContent(String name, String verificationCode) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <title>FindTheOne Email Verification</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                                .container { max-width: 600px; margin: 0 auto; background-color: white; }
                                .header { background: linear-gradient(135deg, #6366f1 0%%, #8b5cf6 100%%); color: white; padding: 40px 30px; text-align: center; }
                                .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                                .header .emoji { font-size: 32px; margin-right: 10px; }
                                .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
                                .content { padding: 40px 30px; color: #333; line-height: 1.6; }
                                .content h2 { color: #333; margin: 0 0 20px 0; font-size: 22px; }
                                .verification-code { background: #6366f1; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; margin: 30px 0; border-radius: 8px; letter-spacing: 4px; }
                                .verify-button { display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                                .verify-button:hover { background: #5855eb; }
                                .important { color: #333; font-weight: bold; margin: 20px 0; }
                                .footer { color: #666; margin-top: 30px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1><span class="emoji">🎯</span>FindTheOne</h1>
                                    <p>Welcome to Your Perfect Match Journey!</p>
                                </div>
                                <div class="content">
                                    <h2>Hello %s!</h2>
                                    
                                    <p>Welcome to FindTheOne! We're excited to have you join our community of people looking for meaningful connections.</p>
                                    
                                    <p>To complete your registration and start discovering amazing people, please verify your email address using the code below:</p>
                                    
                                    <div class="verification-code">%s</div>
                                    
                                    <p>You can also click the button below to go directly to the verification page:</p>
                                    <a href="%s/verify-email" class="verify-button">Verify My Email</a>
                                    
                                    <p class="important"><strong>Important:</strong> This verification code will expire in 24 hours for security purposes.</p>
                                    
                                    <p>If you didn't create this account, please ignore this email and the account will remain unverified.</p>
                                    
                                    <p>Ready to find your perfect match? We can't wait to see the connections you'll make!</p>
                                    
                                    <div class="footer">
                                        <p>Best regards,<br>
                                        The FindTheOne Team</p>
                                        <p><small>© 2025 FindTheOne Dating App. All rights reserved.</small></p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                name, verificationCode, frontendUrl);
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
