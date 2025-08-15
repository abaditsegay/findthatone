# FindTheOne Dating Application

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a full-stack dating application with:
- **Backend**: Spring Boot (Java) with REST APIs, WebSocket support, JWT authentication, and MySQL database
- **Frontend**: ReactJS with modern UI components, real-time messaging, and responsive design

## Backend Architecture
- **Entities**: User, Like, Match, Message
- **Security**: JWT-based authentication with Spring Security
- **Database**: MySQL with JPA/Hibernate
- **Real-time**: WebSocket for chat messaging
- **APIs**: RESTful endpoints for authentication, matching, and messaging

## Frontend Architecture
- **Framework**: React with functional components and hooks
- **Features**: Profile management, swipe-like interface, real-time chat, notifications
- **Design**: Mobile-first responsive UI

## Key Features
1. User registration and authentication
2. Profile creation with photo upload
3. Swipe-like matching system
4. Real-time chat messaging
5. Match suggestions based on preferences
6. Notification system

## Development Guidelines
- Use modern Java patterns and Spring Boot best practices
- Implement proper error handling and validation
- Follow RESTful API design principles
- Ensure mobile-responsive frontend design
- Implement proper security measures
- Use clean, modular code structure

## Database Schema
- `users`: User profiles and authentication
- `likes`: User likes/dislikes for matching
- `matches`: Successful matches between users
- `messages`: Chat messages between matched users

## API Endpoints
- `/api/auth/*`: Authentication endpoints
- `/api/users/*`: User profile management
- `/api/matching/*`: Like/dislike and matching
- `/api/messages/*`: Messaging functionality
- `/ws/*`: WebSocket endpoints for real-time features
