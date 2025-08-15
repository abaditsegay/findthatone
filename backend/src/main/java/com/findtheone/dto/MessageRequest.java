package com.findtheone.dto;

public class MessageRequest {
    private Long receiverId;
    private String content;
    private String type;

    public MessageRequest() {
    }

    public MessageRequest(Long receiverId, String content) {
        this.receiverId = receiverId;
        this.content = content;
    }

    public MessageRequest(Long receiverId, String content, String type) {
        this.receiverId = receiverId;
        this.content = content;
        this.type = type;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
