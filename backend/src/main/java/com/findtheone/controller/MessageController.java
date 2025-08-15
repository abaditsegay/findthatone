package com.findtheone.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.findtheone.dto.MessageRequest;
import com.findtheone.entity.Message;
import com.findtheone.entity.User;
import com.findtheone.repository.MessageRepository;
import com.findtheone.service.CoinService;
import com.findtheone.service.MessageService;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private CoinService coinService;

    @Autowired
    private MessageRepository messageRepository;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(Authentication authentication, @RequestBody MessageRequest messageRequest) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        Message message = messageService.sendMessage(user.getId(), messageRequest);

        if (message != null) {
            return ResponseEntity.ok(message);
        } else {
            return ResponseEntity.badRequest().body("Failed to send message");
        }
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<Message>> getConversation(Authentication authentication,
            @PathVariable Long otherUserId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(null);
        }

        User user = (User) authentication.getPrincipal();
        List<Message> messages = messageService.getConversationWithCoinLogic(user.getId(), otherUserId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/unlock")
    public ResponseEntity<?> unlockMessage(Authentication authentication, @RequestBody Map<String, Object> request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        Long messageId = Long.valueOf(request.get("messageId").toString());

        // Check if message exists and user can access it
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "invalid request",
                    "message", "Message not found"));
        }

        Message message = messageOpt.get();

        // Check if user is trying to unlock their own sent message
        if (message.getSender().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "invalid request",
                    "message", "Cannot unlock your own sent messages"));
        }

        // Check if user is the receiver
        if (!message.getReceiver().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "invalid request",
                    "message", "Access denied - not your message"));
        }

        // Check if message is already unlocked (avoid double processing)
        if (message.getIsUnlocked()) {
            // Already unlocked, just mark as read
            messageService.markMessageAsRead(messageId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message already unlocked",
                    "alreadyUnlocked", true));
        }

        // Now check if user has enough coins for unlocking
        if (!coinService.canAffordMessage(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "insufficient coins",
                    "message", "You need at least 1 coin to unlock this message",
                    "coinsNeeded", 1,
                    "currentCoins", coinService.getUserCoins(user.getId())));
        }

        boolean success = messageService.unlockAndReadMessage(messageId, user.getId());

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message unlocked and marked as read"));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "invalid request",
                    "message", "Failed to unlock message"));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Message>> getUnreadMessages(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(null);
        }

        User user = (User) authentication.getPrincipal();
        List<Message> messages = messageService.getUnreadMessages(user.getId());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadMessageCount(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(null);
        }

        User user = (User) authentication.getPrincipal();
        Long count = messageService.getUnreadMessageCount(user.getId());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/read/{messageId}")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long messageId) {
        messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok("Message marked as read");
    }

    @PutMapping("/read/conversation/{otherUserId}")
    public ResponseEntity<?> markConversationAsRead(Authentication authentication, @PathVariable Long otherUserId) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        User user = (User) authentication.getPrincipal();
        messageService.markConversationAsRead(user.getId(), otherUserId);
        return ResponseEntity.ok("Conversation marked as read");
    }

    // WebSocket endpoint for real-time messaging
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public Message sendMessage(MessageRequest messageRequest) {
        // This will be handled by WebSocket
        return null;
    }
}
