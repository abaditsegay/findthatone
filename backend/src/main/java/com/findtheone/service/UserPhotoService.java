package com.findtheone.service;

import com.findtheone.entity.User;
import com.findtheone.entity.UserPhoto;
import com.findtheone.repository.UserPhotoRepository;
import com.findtheone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserPhotoService {

    @Autowired
    private UserPhotoRepository userPhotoRepository;

    @Autowired
    private UserRepository userRepository;

    public List<UserPhoto> getUserPhotos(Long userId) {
        return userPhotoRepository.findActivePhotosByUserId(userId);
    }

    public Optional<UserPhoto> getPrimaryPhoto(Long userId) {
        return userPhotoRepository.findPrimaryPhotoByUserId(userId);
    }

    public UserPhoto addUserPhoto(Long userId, String photoUrl, String caption) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            // Check if user already has the maximum number of photos (6)
            long currentPhotoCount = userPhotoRepository.countActivePhotosByUserId(userId);
            if (currentPhotoCount >= 6) {
                throw new RuntimeException("Maximum photo limit reached. You can only have up to 6 photos.");
            }

            // Get the next photo order
            Optional<Integer> maxOrder = userPhotoRepository.findMaxPhotoOrderByUserId(userId);
            int nextOrder = maxOrder.orElse(0) + 1;

            UserPhoto photo = new UserPhoto(user.get(), photoUrl, nextOrder, caption);
            return userPhotoRepository.save(photo);
        }
        return null;
    }

    public UserPhoto setPrimaryPhoto(Long userId, Long photoId) {
        Optional<UserPhoto> photo = userPhotoRepository.findById(photoId);
        if (photo.isPresent() && photo.get().getUser().getId().equals(userId)) {
            UserPhoto targetPhoto = photo.get();

            // Get current primary photo
            Optional<UserPhoto> currentPrimary = userPhotoRepository.findPrimaryPhotoByUserId(userId);

            if (currentPrimary.isPresent()) {
                // Swap orders
                UserPhoto currentPrimaryPhoto = currentPrimary.get();
                currentPrimaryPhoto.setPhotoOrder(targetPhoto.getPhotoOrder());
                targetPhoto.setPhotoOrder(1);

                userPhotoRepository.save(currentPrimaryPhoto);
            } else {
                targetPhoto.setPhotoOrder(1);
            }

            return userPhotoRepository.save(targetPhoto);
        }
        return null;
    }

    public boolean deleteUserPhoto(Long userId, Long photoId) {
        Optional<UserPhoto> photo = userPhotoRepository.findById(photoId);
        if (photo.isPresent() && photo.get().getUser().getId().equals(userId)) {
            UserPhoto photoToDelete = photo.get();

            // Don't allow deletion if it's the only photo
            Long photoCount = userPhotoRepository.countActivePhotosByUserId(userId);
            if (photoCount <= 1) {
                return false; // Must have at least one photo
            }

            photoToDelete.setIsActive(false);
            userPhotoRepository.save(photoToDelete);

            // If this was the primary photo, make the next photo primary
            if (photoToDelete.getPhotoOrder() == 1) {
                List<UserPhoto> remainingPhotos = userPhotoRepository.findActivePhotosByUserId(userId);
                if (!remainingPhotos.isEmpty()) {
                    UserPhoto newPrimary = remainingPhotos.get(0);
                    newPrimary.setPhotoOrder(1);
                    userPhotoRepository.save(newPrimary);
                }
            }

            return true;
        }
        return false;
    }

    public long getUserPhotoCount(Long userId) {
        return userPhotoRepository.countActivePhotosByUserId(userId);
    }
}
