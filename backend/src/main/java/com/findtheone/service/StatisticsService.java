package com.findtheone.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.findtheone.repository.LikeRepository;
import com.findtheone.repository.MatchRepository;

/**
 * Service responsible for calculating user statistics
 * Consolidates all statistics-related business logic
 */
@Service
public class StatisticsService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private LikeRepository likeRepository;

    /**
     * Get comprehensive user statistics
     * 
     * @param userId The user ID to get statistics for
     * @return Map containing all user statistics
     */
    public Map<String, Object> getUserStatistics(Long userId) {
        Long matchesCount = (long) matchRepository.findActiveMatchesByUserId(userId).size();
        Long likesGivenCount = likeRepository.countLikesGivenByUser(userId);
        Long likesReceivedCount = likeRepository.countLikesReceivedByUser(userId);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("matchesCount", matchesCount);
        statistics.put("likesGivenCount", likesGivenCount);
        statistics.put("likesReceivedCount", likesReceivedCount);
        statistics.put("totalInteractions", likesGivenCount + matchesCount);
        statistics.put("popularityScore", calculatePopularityScore(likesReceivedCount, matchesCount));
        
        return statistics;
    }

    /**
     * Calculate a popularity score based on likes received and matches
     * 
     * @param likesReceived Number of likes received
     * @param matches Number of matches
     * @return Popularity score (0-100)
     */
    private Double calculatePopularityScore(Long likesReceived, Long matches) {
        if (likesReceived == 0 && matches == 0) {
            return 0.0;
        }
        
        // Simple scoring algorithm - can be enhanced
        double score = (likesReceived * 1.0) + (matches * 2.0);
        return Math.min(100.0, score); // Cap at 100
    }

    /**
     * Get match success rate for a user
     * 
     * @param userId The user ID
     * @return Match success rate as percentage
     */
    public Double getMatchSuccessRate(Long userId) {
        Long likesGiven = likeRepository.countLikesGivenByUser(userId);
        Long matches = (long) matchRepository.findActiveMatchesByUserId(userId).size();
        
        if (likesGiven == 0) {
            return 0.0;
        }
        
        return (matches.doubleValue() / likesGiven.doubleValue()) * 100.0;
    }
}
