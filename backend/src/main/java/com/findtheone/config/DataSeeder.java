package com.findtheone.config;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.findtheone.entity.Like;
import com.findtheone.entity.Match;
import com.findtheone.entity.Message;
import com.findtheone.entity.User;
import com.findtheone.entity.UserPhoto;
import com.findtheone.repository.LikeRepository;
import com.findtheone.repository.MatchRepository;
import com.findtheone.repository.MessageRepository;
import com.findtheone.repository.UserRepository;
import com.findtheone.repository.UserPhotoRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserPhotoRepository userPhotoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        // Only seed data if no users exist
        if (userRepository.count() == 0) {
            List<User> users = createSampleUsers();
            createSamplePhotos(users);
            createSampleLikes(users);
            createSampleMatches(users);
            createSampleMessages(users);
        }
    }

    private List<User> createSampleUsers() {
        List<User> users = new java.util.ArrayList<>();

        // Admin user for system administration
        User adminUser = new User();
        adminUser.setEmail("admin@findtheone.com");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setName("System Administrator");
        adminUser.setAge(30);
        adminUser.setGender(User.Gender.OTHER);
        adminUser.setLocation("System");
        adminUser.setInterests("system administration, user management, content moderation");
        adminUser.setBio("System administrator responsible for managing the platform and ensuring user safety.");
        adminUser.setProfilePhotoUrl("/avatars/admin.svg");
        adminUser.setIsEmailVerified(true); // Admin is pre-verified
        adminUser.setRole(User.Role.ADMIN);
        userRepository.save(adminUser);
        users.add(adminUser);

        // Test user for login (keep this one for static login) - mark as verified
        User testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));
        testUser.setName("Test User");
        testUser.setAge(25);
        testUser.setGender(User.Gender.FEMALE);
        testUser.setLocation("San Francisco, CA");
        testUser.setInterests("testing, debugging, quality assurance");
        testUser.setBio("Quality assurance engineer who loves finding bugs and ensuring great user experiences!");
        testUser.setProfilePhotoUrl("/avatars/avatar10.svg");
        testUser.setIsEmailVerified(true); // Test user is pre-verified for testing
        testUser.setRole(User.Role.USER);
        userRepository.save(testUser);
        users.add(testUser);

        // Realistic sample users - all require email verification
        User user1 = new User();
        user1.setEmail("emma.garcia@gmail.com");
        user1.setPassword(passwordEncoder.encode("password123"));
        user1.setName("Emma Garcia");
        user1.setAge(28);
        user1.setGender(User.Gender.FEMALE);
        user1.setLocation("New York, NY");
        user1.setInterests("photography, hiking, craft beer, live music, farmers markets");
        user1.setBio("Marketing professional by day, adventure seeker by weekend. Love capturing moments through my camera lens and exploring hidden gems in the city. Always down for a good hike or trying new breweries!");
        user1.setProfilePhotoUrl("/avatars/avatar1.svg");
        user1.setIsEmailVerified(false); // Requires verification
        user1.setRole(User.Role.USER);
        userRepository.save(user1);
        users.add(user1);

        User user2 = new User();
        user2.setEmail("james.thompson@outlook.com");
        user2.setPassword(passwordEncoder.encode("password123"));
        user2.setName("James Thompson");
        user2.setAge(31);
        user2.setGender(User.Gender.MALE);
        user2.setLocation("Austin, TX");
        user2.setInterests("rock climbing, cooking, vinyl records, craft cocktails, board games");
        user2.setBio("Software engineer with a passion for both indoor and outdoor adventures. I spend my weekends either scaling rock walls or experimenting with new recipes. Vinyl collector and cocktail enthusiast!");
        user2.setProfilePhotoUrl("/avatars/avatar2.svg");
        user2.setIsEmailVerified(false); // Requires verification
        user2.setRole(User.Role.USER);
        userRepository.save(user2);
        users.add(user2);

        User user3 = new User();
        user3.setEmail("sophia.chen@yahoo.com");
        user3.setPassword(passwordEncoder.encode("password123"));
        user3.setName("Sophia Chen");
        user3.setAge(26);
        user3.setGender(User.Gender.FEMALE);
        user3.setLocation("Seattle, WA");
        user3.setInterests("yoga, sustainable living, books, coffee roasting, travel");
        user3.setBio("Yoga instructor and environmental scientist. Passionate about mindful living and protecting our planet. Love discovering new coffee roasts and planning my next eco-friendly adventure!");
        user3.setProfilePhotoUrl("/avatars/avatar3.svg");
        user3.setIsEmailVerified(false); // Requires verification
        user3.setRole(User.Role.USER);
        userRepository.save(user3);
        users.add(user3);

        User user4 = new User();
        user4.setEmail("miguel.rodriguez@gmail.com");
        user4.setPassword(passwordEncoder.encode("password123"));
        user4.setName("Miguel Rodriguez");
        user4.setAge(29);
        user4.setGender(User.Gender.MALE);
        user4.setLocation("Miami, FL");
        user4.setInterests("salsa dancing, beach volleyball, scuba diving, food trucks, art galleries");
        user4.setBio("Dance instructor and marine biologist. Love the ocean as much as I love the dance floor! Always looking for someone to join me for beach volleyball or explore the local art scene.");
        user4.setProfilePhotoUrl("/avatars/avatar4.svg");
        user4.setIsEmailVerified(false); // Requires verification
        user4.setRole(User.Role.USER);
        userRepository.save(user4);
        users.add(user4);

        User user5 = new User();
        user5.setEmail("alex.kim@protonmail.com");
        user5.setPassword(passwordEncoder.encode("password123"));
        user5.setName("Alex Kim");
        user5.setAge(27);
        user5.setGender(User.Gender.OTHER);
        user5.setLocation("Portland, OR");
        user5.setInterests("indie films, urban gardening, vintage fashion, podcasts, local theater");
        user5.setBio("Film critic and urban farmer. Spend my time between dark movie theaters and sunny garden plots. Love discovering indie gems and growing my own vegetables. Always up for deep conversations!");
        user5.setProfilePhotoUrl("/avatars/avatar5.svg");
        user5.setIsEmailVerified(false); // Requires verification
        user5.setRole(User.Role.USER);
        userRepository.save(user5);
        users.add(user5);

        User user6 = new User();
        user6.setEmail("isabella.martinez@icloud.com");
        user6.setPassword(passwordEncoder.encode("password123"));
        user6.setName("Isabella Martinez");
        user6.setAge(24);
        user6.setGender(User.Gender.FEMALE);
        user6.setLocation("Los Angeles, CA");
        user6.setInterests("surfing, painting, meditation, vegan cooking, music festivals");
        user6.setBio("Artist and surf instructor living the California dream. My mornings start with waves and my evenings end with paintbrushes. Vegan foodie who loves sharing recipes and good vibes!");
        user6.setProfilePhotoUrl("/avatars/avatar6.svg");
        user6.setIsEmailVerified(false); // Requires verification
        user6.setRole(User.Role.USER);
        userRepository.save(user6);
        users.add(user6);

        User user7 = new User();
        user7.setEmail("david.wilson@gmail.com");
        user7.setPassword(passwordEncoder.encode("password123"));
        user7.setName("David Wilson");
        user7.setAge(33);
        user7.setGender(User.Gender.MALE);
        user7.setLocation("Denver, CO");
        user7.setInterests("skiing, craft beer brewing, mountain biking, astronomy, woodworking");
        user7.setBio("Mountain enthusiast and craft beer brewer. Winters are for skiing, summers for biking. I build furniture in my spare time and love stargazing on clear mountain nights. Let's explore the Rockies together!");
        user7.setProfilePhotoUrl("/avatars/avatar7.svg");
        user7.setIsEmailVerified(false); // Requires verification
        user7.setRole(User.Role.USER);
        userRepository.save(user7);
        users.add(user7);

        User user8 = new User();
        user8.setEmail("maya.patel@hotmail.com");
        user8.setPassword(passwordEncoder.encode("password123"));
        user8.setName("Maya Patel");
        user8.setAge(30);
        user8.setGender(User.Gender.FEMALE);
        user8.setLocation("Chicago, IL");
        user8.setInterests("marathon running, wine tasting, architecture tours, cooking classes, jazz clubs");
        user8.setBio("Architect and marathon runner. I design buildings by day and explore the city by foot. Wine enthusiast who loves discovering new restaurants and jazz venues. Always training for the next race!");
        user8.setProfilePhotoUrl("/avatars/avatar8.svg");
        user8.setIsEmailVerified(false); // Requires verification
        user8.setRole(User.Role.USER);
        userRepository.save(user8);
        users.add(user8);

        System.out.println("Sample users created successfully!");
        return users;
    }

    private void createSamplePhotos(List<User> users) {
        // Define photo sets for each user based on their interests and lifestyle
        String[][] userPhotoSets = {
            // Test user - simple professional set
            {"/avatars/avatar10.svg", "/avatars/lifestyle8.svg"},
            
            // Emma Garcia - Photography, hiking, craft beer, live music, farmers markets
            {"/avatars/avatar1.svg", "/avatars/lifestyle1.svg", "/avatars/lifestyle7.svg"},
            
            // James Thompson - Rock climbing, cooking, vinyl records, craft cocktails, board games
            {"/avatars/avatar2.svg", "/avatars/lifestyle1.svg", "/avatars/lifestyle6.svg", "/avatars/lifestyle8.svg"},
            
            // Sophia Chen - Yoga, sustainable living, books, coffee roasting, travel
            {"/avatars/avatar3.svg", "/avatars/lifestyle3.svg", "/avatars/lifestyle6.svg"},
            
            // Miguel Rodriguez - Salsa dancing, beach volleyball, scuba diving, food trucks, art galleries
            {"/avatars/avatar4.svg", "/avatars/lifestyle2.svg", "/avatars/lifestyle5.svg", "/avatars/lifestyle4.svg"},
            
            // Alex Kim - Indie films, urban gardening, vintage fashion, podcasts, local theater
            {"/avatars/avatar5.svg", "/avatars/lifestyle4.svg", "/avatars/lifestyle7.svg", "/avatars/lifestyle8.svg"},
            
            // Isabella Martinez - Surfing, painting, meditation, vegan cooking, music festivals
            {"/avatars/avatar6.svg", "/avatars/lifestyle2.svg", "/avatars/lifestyle4.svg", "/avatars/lifestyle7.svg"},
            
            // David Wilson - Skiing, craft beer brewing, mountain biking, astronomy, woodworking
            {"/avatars/avatar7.svg", "/avatars/lifestyle1.svg", "/avatars/lifestyle6.svg", "/avatars/lifestyle8.svg"},
            
            // Maya Patel - Marathon running, wine tasting, architecture tours, cooking classes, jazz clubs
            {"/avatars/avatar8.svg", "/avatars/lifestyle5.svg", "/avatars/lifestyle3.svg", "/avatars/lifestyle6.svg", "/avatars/lifestyle7.svg"}
        };

        String[] photoCaptions = {
            "My favorite outdoor adventure spot",
            "Beach day vibes",
            "Professional mode activated",
            "Creative soul at work", 
            "Staying active and healthy",
            "Culinary adventures",
            "Music is life",
            "Tech life balance"
        };

        for (int i = 0; i < users.size() && i < userPhotoSets.length; i++) {
            User user = users.get(i);
            String[] photoUrls = userPhotoSets[i];
            
            for (int j = 0; j < photoUrls.length; j++) {
                UserPhoto photo = new UserPhoto();
                photo.setUser(user);
                photo.setPhotoUrl(photoUrls[j]);
                photo.setPhotoOrder(j + 1);
                photo.setIsActive(true);
                photo.setUploadedAt(LocalDateTime.now().minusDays(random.nextInt(30)));
                
                // Add captions to some photos
                if (j > 0 && random.nextBoolean()) {
                    photo.setCaption(photoCaptions[random.nextInt(photoCaptions.length)]);
                }
                
                userPhotoRepository.save(photo);
            }
        }
        System.out.println("Sample user photos created successfully!");
    }

    private void createSampleLikes(List<User> users) {
        // Create realistic like patterns - not everyone likes everyone
        for (int i = 0; i < users.size(); i++) {
            for (int j = 0; j < users.size(); j++) {
                if (i != j && random.nextDouble() < 0.4) { // 40% chance of liking someone
                    Like like = new Like();
                    like.setLiker(users.get(i));
                    like.setLiked(users.get(j));
                    like.setTimestamp(LocalDateTime.now().minusDays(random.nextInt(30)));
                    like.setIsLike(true);
                    likeRepository.save(like);
                }
            }
        }
        System.out.println("Sample likes created successfully!");
    }

    private void createSampleMatches(List<User> users) {
        // Create matches where both users liked each other
        List<Like> allLikes = likeRepository.findAll();
        
        for (Like like1 : allLikes) {
            for (Like like2 : allLikes) {
                if (like1.getLiker().getId().equals(like2.getLiked().getId()) && 
                    like1.getLiked().getId().equals(like2.getLiker().getId()) &&
                    matchRepository.findActiveMatchBetweenUsers(like1.getLiker().getId(), like1.getLiked().getId()).isEmpty()) {
                    
                    Match match = new Match();
                    match.setUser1(like1.getLiker());
                    match.setUser2(like1.getLiked());
                    match.setMatchedAt(LocalDateTime.now().minusDays(random.nextInt(20)));
                    match.setIsActive(true);
                    matchRepository.save(match);
                }
            }
        }
        System.out.println("Sample matches created successfully!");
    }

    private void createSampleMessages(List<User> users) {
        List<Match> allMatches = matchRepository.findAll();
        
        String[] sampleMessages = {
            "Hey! How's your day going?",
            "I love your profile! We have so much in common.",
            "Your photos are amazing! Where was that hiking picture taken?",
            "Thanks for the like! I'd love to get to know you better.",
            "Hi there! What's your favorite place to grab coffee?",
            "I see you're into hiking too! Any favorite trails?",
            "Your bio made me smile 😊 Would love to chat more!",
            "Hey! I'm new to the area, any restaurant recommendations?",
            "I noticed we both love live music. Been to any good shows lately?",
            "Hi! Your travel photos are incredible. What's your favorite destination?",
            "Thanks for matching! What do you like to do for fun?",
            "Hey there! I'd love to hear more about your interests.",
            "Your sense of humor comes through in your bio! Very refreshing 😄",
            "Hi! I see we're both food enthusiasts. What's your go-to cuisine?",
            "Great profile! Would you be interested in getting coffee sometime?",
            "Hey! I love that you're into sustainable living. Any tips?",
            "Hi there! Your adventure photos are inspiring. Tell me more!",
            "Thanks for the match! What's been the highlight of your week?",
            "Hey! I see we both love the arts. Any gallery recommendations?",
            "Your cooking hobby caught my eye! What's your specialty dish?"
        };

        String[] replies = {
            "Thanks! It's been pretty good, just finished a great workout.",
            "That's so sweet of you to say! I'd love to chat more too.",
            "Thank you! That was at Mount Rainier - absolutely stunning views.",
            "Of course! I'm always excited to meet new people.",
            "I'm obsessed with this little café called Blue Bottle. You?",
            "I love the trails around Point Reyes! Very peaceful.",
            "Aw, thank you! I try to keep things light and fun.",
            "Welcome to the city! You have to try Tartine - amazing food.",
            "Just saw an incredible jazz show downtown! Do you have a favorite genre?",
            "Thank you! I think my favorite was definitely Iceland - so magical.",
            "I love trying new restaurants and going to art galleries. You?",
            "I'm really into photography and rock climbing. How about you?",
            "Haha, I'm glad it comes across! Life's too short to be too serious.",
            "I'm all about Mediterranean food lately! What about you?",
            "I'd love that! I know a great spot with amazing pastries.",
            "Absolutely! I started composting recently - it's easier than you think.",
            "Thank you! I love sharing my adventures. What's your next trip?",
            "Thanks for asking! I finally finished a painting I've been working on.",
            "Yes! The SFMOMA has an amazing contemporary exhibit right now.",
            "I make a mean pasta carbonara! Do you cook much?"
        };

        for (Match match : allMatches) {
            // Create 1-5 messages per match
            int messageCount = random.nextInt(5) + 1;
            User user1 = match.getUser1();
            User user2 = match.getUser2();
            
            for (int i = 0; i < messageCount; i++) {
                Message message = new Message();
                
                // Alternate between users sending messages
                if (i % 2 == 0) {
                    message.setSender(user1);
                    message.setReceiver(user2);
                } else {
                    message.setSender(user2);  
                    message.setReceiver(user1);
                }
                
                // Choose appropriate message content
                if (i == 0) {
                    message.setContent(sampleMessages[random.nextInt(sampleMessages.length)]);
                } else {
                    message.setContent(replies[random.nextInt(replies.length)]);
                }
                
                message.setSentAt(LocalDateTime.now().minusDays(random.nextInt(15)).minusHours(random.nextInt(24)));
                message.setMessageType(Message.MessageType.TEXT);
                message.setIsRead(random.nextBoolean()); // Randomly set read status
                messageRepository.save(message);
            }
        }
        System.out.println("Sample messages created successfully!");
    }
}
