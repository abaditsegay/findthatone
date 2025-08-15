package com.findtheone.dto;

/**
 * Data Transfer Object for user statistics
 */
public class UserStatsDTO {
    private Long matchesCount;
    private Long likesGivenCount;
    private Long likesReceivedCount;
    private Long totalInteractions;
    private Double popularityScore;
    private Double matchSuccessRate;
    private Boolean isEmailVerified;

    public UserStatsDTO() {}

    public UserStatsDTO(Long matchesCount, Long likesGivenCount, Long likesReceivedCount, 
                       Long totalInteractions, Double popularityScore, Double matchSuccessRate, 
                       Boolean isEmailVerified) {
        this.matchesCount = matchesCount;
        this.likesGivenCount = likesGivenCount;
        this.likesReceivedCount = likesReceivedCount;
        this.totalInteractions = totalInteractions;
        this.popularityScore = popularityScore;
        this.matchSuccessRate = matchSuccessRate;
        this.isEmailVerified = isEmailVerified;
    }

    // Getters and Setters
    public Long getMatchesCount() {
        return matchesCount;
    }

    public void setMatchesCount(Long matchesCount) {
        this.matchesCount = matchesCount;
    }

    public Long getLikesGivenCount() {
        return likesGivenCount;
    }

    public void setLikesGivenCount(Long likesGivenCount) {
        this.likesGivenCount = likesGivenCount;
    }

    public Long getLikesReceivedCount() {
        return likesReceivedCount;
    }

    public void setLikesReceivedCount(Long likesReceivedCount) {
        this.likesReceivedCount = likesReceivedCount;
    }

    public Long getTotalInteractions() {
        return totalInteractions;
    }

    public void setTotalInteractions(Long totalInteractions) {
        this.totalInteractions = totalInteractions;
    }

    public Double getPopularityScore() {
        return popularityScore;
    }

    public void setPopularityScore(Double popularityScore) {
        this.popularityScore = popularityScore;
    }

    public Double getMatchSuccessRate() {
        return matchSuccessRate;
    }

    public void setMatchSuccessRate(Double matchSuccessRate) {
        this.matchSuccessRate = matchSuccessRate;
    }

    public Boolean getIsEmailVerified() {
        return isEmailVerified;
    }

    public void setIsEmailVerified(Boolean isEmailVerified) {
        this.isEmailVerified = isEmailVerified;
    }
}
