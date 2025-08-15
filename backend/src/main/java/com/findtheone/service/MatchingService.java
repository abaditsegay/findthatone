package com.findtheone.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.findtheone.dto.MatchDTO;
import com.findtheone.entity.Like;
import com.findtheone.entity.Match;
import com.findtheone.entity.User;
import com.findtheone.repository.LikeRepository;
import com.findtheone.repository.MatchRepository;
import com.findtheone.repository.UserRepository;

@Service
public class MatchingService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private UserRepository userRepository;

    public boolean likeUser(Long likerId, Long likedId) {
        // Check if already liked
        if (likeRepository.existsByLikerIdAndLikedId(likerId, likedId)) {
            return false; // Already liked
        }

        Optional<User> liker = userRepository.findById(likerId);
        Optional<User> liked = userRepository.findById(likedId);

        if (liker.isPresent() && liked.isPresent()) {
            Like like = new Like(liker.get(), liked.get(), true);
            likeRepository.save(like);

            // Check if it's a match (both users liked each other)
            if (likeRepository.isMatch(likerId, likedId)) {
                createMatch(liker.get(), liked.get());
                return true; // It's a match!
            }
        }
        return false; // Like saved but no match
    }

    public void dislikeUser(Long likerId, Long likedId) {
        Optional<User> liker = userRepository.findById(likerId);
        Optional<User> liked = userRepository.findById(likedId);

        if (liker.isPresent() && liked.isPresent()) {
            Like dislike = new Like(liker.get(), liked.get(), false);
            likeRepository.save(dislike);
        }
    }

    private void createMatch(User user1, User user2) {
        // Check if match already exists
        Optional<Match> existingMatch = matchRepository.findActiveMatchBetweenUsers(user1.getId(), user2.getId());

        if (!existingMatch.isPresent()) {
            Match match = new Match(user1, user2);
            matchRepository.save(match);
        }
    }

    public List<Match> getUserMatches(Long userId) {
        return matchRepository.findActiveMatchesByUserId(userId);
    }

    public List<MatchDTO> getUserMatchDTOs(Long userId) {
        List<Match> matches = matchRepository.findActiveMatchesByUserId(userId);
        return matches.stream()
                .map(match -> {
                    // Determine which user is the matched user (not the current user)
                    User matchedUser = match.getUser1().getId().equals(userId) ? match.getUser2() : match.getUser1();

                    return new MatchDTO(
                            match.getId(),                 // The match record ID
                            matchedUser.getId(),           // The matched user's ID
                            matchedUser.getName(),
                            matchedUser.getAge(),
                            matchedUser.getBio(),
                            matchedUser.getLocation(),
                            matchedUser.getProfilePhotoUrl(),
                            matchedUser.getGender() != null ? matchedUser.getGender().toString() : null,
                            matchedUser.getInterests(),
                            match.getMatchedAt());
                })
                .collect(Collectors.toList());
    }

    public List<User> getUserSuggestions(Long userId) {
        // Return users that haven't been liked or disliked by the current user
        return userRepository.findPotentialMatches(userId);
    }
}
