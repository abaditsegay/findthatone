# FindTheOne - Dating Application

A modern, full-stack dating application built with Spring Boot and React.js, featuring real-time messaging, intelligent matching, and a beautiful, responsive user interface.

## 🚀 Features

### Backend Features
- **User Authentication**: JWT-based secure authentication system
- **Profile Management**: Complete user profile creation and management
- **Smart Matching**: Algorithm-based matching system with like/dislike functionality
- **Real-time Messaging**: WebSocket-powered instant messaging
- **Database Integration**: MySQL database with JPA/Hibernate
- **RESTful APIs**: Well-designed REST endpoints for all functionalities
- **Security**: Spring Security with CORS support

### Frontend Features
- **Modern UI**: React.js with responsive, mobile-first design
- **Profile Cards**: Tinder-like swipe interface for user matching
- **Real-time Chat**: Instant messaging with WebSocket integration
- **Photo Upload**: Profile picture management
- **Match Notifications**: Real-time notifications for new matches
- **Settings Management**: User preferences and account settings

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.4
- **Language**: Java 17
- **Database**: MySQL
- **Security**: Spring Security + JWT
- **Real-time**: WebSocket with STOMP
- **Build Tool**: Maven

### Frontend
- **Framework**: React.js 19.1.1
- **Language**: JavaScript/JSX
- **Styling**: CSS3 with responsive design
- **Build Tool**: Create React App
- **Package Manager**: Yarn

## � Project Structure

```
FindTheOne/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Application properties
│   ├── pom.xml            # Maven configuration
│   └── target/            # Compiled classes
├── frontend/              # React frontend
│   ├── src/              # React source code
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
├── infra/                # Azure infrastructure (Bicep)
│   ├── main.bicep        # Infrastructure as Code
│   └── main.parameters.json
├── .github/workflows/    # CI/CD pipelines
├── azure.yaml           # Azure Developer CLI config
└── deploy.sh           # Deployment script
```

## �📋 Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher
- Yarn package manager

## 🚀 Getting Started

### Database Setup

1. Start MySQL server
2. Create a database named `findtheone`:
   ```sql
   CREATE DATABASE findtheone;
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Update database credentials in `src/main/resources/application.properties` if needed
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
4. The backend will be available at `http://localhost:8091`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development server:
   ```bash
   yarn start
   ```
4. The frontend will be available at `http://localhost:3000`

## ☁️ Azure Deployment

### Prerequisites for Azure Deployment

1. **Azure Account**: Create a free account at [azure.com](https://azure.com)
2. **Azure Developer CLI**: Install from [aka.ms/install-azd](https://aka.ms/install-azd)
3. **Azure CLI**: Install from [docs.microsoft.com/cli/azure/install-azure-cli](https://docs.microsoft.com/cli/azure/install-azure-cli)

### Quick Deployment

1. **Clone and navigate to the project**:
   ```bash
   git clone <repository-url>
   cd FindTheOne
   ```

2. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

   This script will:
   - Check prerequisites
   - Build both backend and frontend
   - Provision Azure infrastructure
   - Deploy applications to Azure

3. **Follow the prompts** to configure:
   - Environment name (dev, staging, prod)
   - Azure region (eastus, westus2, etc.)
   - MySQL admin credentials
   - Other configuration options

### Manual Deployment Steps

If you prefer manual control over the deployment:

1. **Login to Azure**:
   ```bash
   azd auth login
   ```

2. **Initialize the environment**:
   ```bash
   azd init
   ```

3. **Set environment variables**:
   ```bash
   azd env set AZURE_LOCATION eastus
   azd env set MYSQL_ADMIN_USERNAME findtheoneadmin
   azd env set MYSQL_ADMIN_PASSWORD YourSecurePassword123!
   azd env set JWT_SECRET $(openssl rand -base64 32)
   ```

4. **Provision infrastructure**:
   ```bash
   azd provision
   ```

5. **Deploy applications**:
   ```bash
   azd deploy
   ```

### Azure Resources Created

The deployment creates the following Azure resources:

- **App Service Plan**: Hosts the Spring Boot backend
- **App Service**: Runs the Java application  
- **Static Web App**: Hosts the React frontend
- **Azure Database for MySQL**: Database server
- **Log Analytics Workspace**: Application monitoring
- **Application Insights**: Performance monitoring
- **Managed Identity**: Secure resource access

### Environment Variables

The application uses these environment variables in Azure:

| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | MySQL connection string |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `APP_JWT_SECRET` | JWT signing secret |
| `REACT_APP_API_URL` | Backend API URL for frontend |

### Monitoring and Logs

- **Application Insights**: Monitor performance and errors
- **Log Analytics**: Query application logs
- **App Service Logs**: Stream live logs from the backend

```bash
# View deployment status
azd show

# Stream backend logs
az webapp log tail --name <backend-app-name> --resource-group <resource-group>

# View frontend deployment
az staticwebapp show --name <frontend-app-name> --resource-group <resource-group>
```

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `name`
- `age`
- `gender` (MALE, FEMALE, OTHER)
- `location`
- `interests` (Text)
- `bio` (Text)
- `profile_photo_url`
- `is_active`
- `is_email_verified`
- `created_at`
- `updated_at`

### Likes Table
- `id` (Primary Key)
- `liker_id` (Foreign Key)
- `liked_id` (Foreign Key)
- `timestamp`
- `is_like` (Boolean)

### Matches Table
- `id` (Primary Key)
- `user1_id` (Foreign Key)
- `user2_id` (Foreign Key)
- `matched_at`
- `is_active`

### Messages Table
- `id` (Primary Key)
- `sender_id` (Foreign Key)
- `receiver_id` (Foreign Key)
- `content` (Text)
- `sent_at`
- `is_read`
- `message_type` (TEXT, IMAGE, EMOJI)

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/matches` - Get potential matches
- `GET /api/users/{id}` - Get user by ID

### Matching System
- `POST /api/matching/like/{userId}` - Like a user
- `POST /api/matching/dislike/{userId}` - Dislike a user
- `GET /api/matching/matches` - Get user's matches

### Messaging
- `POST /api/messages/send` - Send a message
- `GET /api/messages/conversation/{userId}` - Get conversation
- `GET /api/messages/unread` - Get unread messages
- `PUT /api/messages/read/{messageId}` - Mark message as read

### WebSocket
- `/ws` - WebSocket connection endpoint
- `/app/chat.sendMessage` - Send real-time message
- `/topic/public` - Subscribe to messages

## 🧪 Sample Data

The application includes a data seeder that creates sample users for testing:

- **john.doe@example.com** / password123
- **jane.smith@example.com** / password123
- **mike.johnson@example.com** / password123
- **sarah.williams@example.com** / password123
- **alex.brown@example.com** / password123

## 🔐 Security Features

- JWT token-based authentication
- Password encryption using BCrypt
- CORS configuration for cross-origin requests
- Protected API endpoints
- SQL injection prevention with JPA
- Azure Managed Identity for secure resource access

## 🚀 Local Development vs Azure

### Local Development
- Backend runs on `http://localhost:8091`
- Frontend runs on `http://localhost:3000`
- Local MySQL database
- Hot reloading for development

### Azure Production
- Backend hosted on Azure App Service
- Frontend hosted on Azure Static Web Apps
- Azure Database for MySQL
- SSL/HTTPS enabled
- Auto-scaling and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Spring Boot community for excellent documentation
- React.js team for the powerful frontend framework
- Azure team for cloud hosting platform
- Unsplash for sample profile images
- All contributors and testers

---

**Happy Dating! 💕**

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `name`
- `age`
- `gender` (MALE, FEMALE, OTHER)
- `location`
- `interests` (Text)
- `bio` (Text)
- `profile_photo_url`
- `is_active`
- `is_email_verified`
- `created_at`
- `updated_at`

### Likes Table
- `id` (Primary Key)
- `liker_id` (Foreign Key)
- `liked_id` (Foreign Key)
- `timestamp`
- `is_like` (Boolean)

### Matches Table
- `id` (Primary Key)
- `user1_id` (Foreign Key)
- `user2_id` (Foreign Key)
- `matched_at`
- `is_active`

### Messages Table
- `id` (Primary Key)
- `sender_id` (Foreign Key)
- `receiver_id` (Foreign Key)
- `content` (Text)
- `sent_at`
- `is_read`
- `message_type` (TEXT, IMAGE, EMOJI)

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/matches` - Get potential matches
- `GET /api/users/{id}` - Get user by ID

### Matching System
- `POST /api/matching/like/{userId}` - Like a user
- `POST /api/matching/dislike/{userId}` - Dislike a user
- `GET /api/matching/matches` - Get user's matches

### Messaging
- `POST /api/messages/send` - Send a message
- `GET /api/messages/conversation/{userId}` - Get conversation
- `GET /api/messages/unread` - Get unread messages
- `PUT /api/messages/read/{messageId}` - Mark message as read

### WebSocket
- `/ws` - WebSocket connection endpoint
- `/app/chat.sendMessage` - Send real-time message
- `/topic/public` - Subscribe to messages

## 🧪 Sample Data

The application includes a data seeder that creates sample users for testing:

- **john.doe@example.com** / password123
- **jane.smith@example.com** / password123
- **mike.johnson@example.com** / password123
- **sarah.williams@example.com** / password123
- **alex.brown@example.com** / password123

## 🔐 Security Features

- JWT token-based authentication
- Password encryption using BCrypt
- CORS configuration for cross-origin requests
- Protected API endpoints
- SQL injection prevention with JPA

## 📱 Frontend Components

### Key Components (To be implemented)
- `Login/Signup` - Authentication forms
- `ProfileSetup` - User profile creation
- `ProfileCards` - Swipeable user cards
- `MatchSuggestions` - Potential matches display
- `Chat` - Real-time messaging interface
- `Settings` - User preferences and settings

## 🚀 Deployment

### Backend Deployment
1. Build the application:
   ```bash
   mvn clean package
   ```
2. Run the JAR file:
   ```bash
   java -jar target/findtheone-0.0.1-SNAPSHOT.jar
   ```

### Frontend Deployment
1. Build for production:
   ```bash
   cd frontend
   yarn build
   ```
2. Serve the `build` directory using a web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Spring Boot community for excellent documentation
- React.js team for the powerful frontend framework
- Unsplash for sample profile images
- All contributors and testers

---

**Happy Dating! 💕**
