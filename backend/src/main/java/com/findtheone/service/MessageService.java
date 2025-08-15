package com.findtheone.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.findtheone.dto.MessageRequest;
import com.findtheone.entity.Message;
import com.findtheone.entity.User;
import com.findtheone.repository.MessageRepository;
import com.findtheone.repository.UserRepository;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoinService coinService;

    public Message sendMessage(Long senderId, MessageRequest messageRequest) {
        Optional<User> sender = userRepository.findById(senderId);
        Optional<User> receiver = userRepository.findById(messageRequest.getReceiverId());

        if (sender.isPresent() && receiver.isPresent()) {
            Message message = new Message(sender.get(), receiver.get(), messageRequest.getContent());
            return messageRepository.save(message);
        }
        return null;
    }

    public List<Message> getConversation(Long user1Id, Long user2Id) {
        return messageRepository.findConversationBetweenUsers(user1Id, user2Id);
    }

    public List<Message> getConversationWithCoinLogic(Long currentUserId, Long otherUserId) {
        List<Message> messages = messageRepository.findConversationBetweenUsers(currentUserId, otherUserId);

        // Apply coin logic: messages sent by current user are always visible
        // Messages received by current user need to be unlocked with coins (unless
        // already unlocked)
        for (Message message : messages) {
            if (message.getReceiver().getId().equals(currentUserId) && !message.getIsUnlocked()) {
                // This is a received message that hasn't been unlocked yet
                // The frontend will need to handle this by showing locked content
            }
        }

        return messages;
    }

    public List<Message> getUnreadMessages(Long userId) {
        return messageRepository.findUnreadMessagesByUserId(userId);
    }

    public Long getUnreadMessageCount(Long userId) {
        return messageRepository.countUnreadMessagesByUserId(userId);
    }

    public void markMessageAsRead(Long messageId) {
        Optional<Message> message = messageRepository.findById(messageId);
        if (message.isPresent()) {
            Message msg = message.get();
            msg.setIsRead(true);
            messageRepository.save(msg);
        }
    }

    @Transactional
    public boolean unlockAndReadMessage(Long messageId, Long userId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return false;
        }

        Message message = messageOpt.get();

        // Check if user is the receiver
        if (!message.getReceiver().getId().equals(userId)) {
            return false;
        }

        // If already unlocked, just mark as read
        if (message.getIsUnlocked()) {
            message.setIsRead(true);
            messageRepository.save(message);
            return true;
        }

        // Try to spend coins to unlock
        boolean unlocked = coinService.unlockMessage(userId,
                "Unlocked message from " + message.getSender().getName());

        if (unlocked) {
            message.setIsUnlocked(true);
            message.setIsRead(true);
            messageRepository.save(message);
            return true;
        }

        return false; // Insufficient coins
    }

    public void markConversationAsRead(Long userId, Long otherUserId) {
        List<Message> messages = messageRepository.findConversationBetweenUsers(userId, otherUserId);
        for (Message message : messages) {
            if (message.getReceiver().getId().equals(userId) && !message.getIsRead() && message.getIsUnlocked()) {
                message.setIsRead(true);
                messageRepository.save(message);
            }
        }
    }

    public boolean canUserReadMessage(Long messageId, Long userId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return false;
        }

        Message message = messageOpt.get();

        // User can always read messages they sent
        if (message.getSender().getId().equals(userId)) {
            return true;
        }

        // User can read received messages if they're unlocked
        if (message.getReceiver().getId().equals(userId)) {
            return message.getIsUnlocked();
        }

        return false; // Not involved in this message
    }
}
