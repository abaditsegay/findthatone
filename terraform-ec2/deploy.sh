#!/bin/bash

# FindTheOne Application Deployment Script
# This script deploys the backend and frontend to the EC2 instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/findtheone"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGINX_CONF="/etc/nginx/sites-available/findtheone"
SYSTEMD_BACKEND="/etc/systemd/system/findtheone-backend.service"
SYSTEMD_FRONTEND="/etc/systemd/system/findtheone-frontend.service"

# Get instance IP
INSTANCE_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo -e "${BLUE}Starting FindTheOne deployment...${NC}"
echo -e "${BLUE}Instance IP: $INSTANCE_IP${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Wait for user data script to complete
print_status "Waiting for initial setup to complete..."
while [ ! -f "$PROJECT_DIR/deployment-status.txt" ]; do
    print_status "Waiting for system initialization..."
    sleep 10
done

print_status "System initialization completed. Starting application deployment..."

# Clone or update the repository
print_status "Setting up application code..."
if [ ! -d "$PROJECT_DIR/findthatone" ]; then
    cd $PROJECT_DIR
    git clone https://github.com/abaditsegay/findthatone.git
else
    cd $PROJECT_DIR/findthatone
    git pull origin master
fi

# Copy source code to working directories
print_status "Copying application files..."
rm -rf $BACKEND_DIR $FRONTEND_DIR
cp -r $PROJECT_DIR/findthatone/backend $BACKEND_DIR
cp -r $PROJECT_DIR/findthatone/frontend $FRONTEND_DIR

# Configure backend application properties
print_status "Configuring backend..."
cat > $BACKEND_DIR/src/main/resources/application-prod.properties << EOF
# Production Configuration for FindTheOne
spring.application.name=FindTheOne

# Active Profile
spring.profiles.active=prod

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/findtheone_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=findtheone_user
spring.datasource.password=\${DB_PASSWORD:FindTheOne2024App!}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=false

# Server Configuration
server.port=8091
server.address=0.0.0.0

# CORS Configuration
spring.web.cors.allowed-origins=http://$INSTANCE_IP,http://localhost,http://127.0.0.1
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# JWT Configuration
app.jwt.secret=\${JWT_SECRET:findtheone-secret-key-for-jwt-token-generation-should-be-at-least-256-bits}
app.jwt.expiration=86400000

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Static Resources Configuration
spring.web.resources.static-locations=classpath:/static/,file:$PROJECT_DIR/uploads/

# WebSocket Configuration
spring.websocket.allowed-origins=http://$INSTANCE_IP,http://localhost,http://127.0.0.1

# Email Configuration (Update with your settings)
spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=4289976f726845
spring.mail.password=29bcc77310bf5d
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Application Configuration
app.frontend.url=http://$INSTANCE_IP

# Logging Configuration
logging.level.root=INFO
logging.level.com.findtheone=INFO
logging.file.name=$PROJECT_DIR/logs/application.log
logging.file.max-size=10MB
logging.file.max-history=10
EOF

# Update main application.properties to use prod profile
echo "spring.profiles.active=prod" > $BACKEND_DIR/src/main/resources/application.properties

# Build backend
print_status "Building backend application..."
cd $BACKEND_DIR
chmod +x mvnw
./mvnw clean package -DskipTests

# Create uploads directory
mkdir -p $PROJECT_DIR/uploads/photos
mkdir -p $PROJECT_DIR/logs

# Configure frontend
print_status "Configuring frontend..."
cd $FRONTEND_DIR

# Create .env.production file
cat > .env.production << EOF
REACT_APP_API_URL=http://$INSTANCE_IP:8091/api
REACT_APP_BACKEND_URL=http://$INSTANCE_IP:8091
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
EOF

# Install dependencies and build
print_status "Building frontend application..."
npm install
npm run build

# Configure Nginx
print_status "Configuring Nginx..."
cat > $NGINX_CONF << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend static files
    location / {
        root /opt/findtheone/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8091/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://localhost:8091/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    location /uploads/ {
        alias /opt/findtheone/uploads/;
        expires 1d;
        add_header Cache-Control "public";
    }
}
EOF

# Enable Nginx site
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Create systemd service for backend
print_status "Creating backend service..."
cat > $SYSTEMD_BACKEND << EOF
[Unit]
Description=FindTheOne Backend Application
After=mysql.service
Requires=mysql.service

[Service]
Type=simple
User=findtheone
Group=findtheone
WorkingDirectory=$BACKEND_DIR
ExecStart=/usr/bin/java -jar $BACKEND_DIR/target/FindTheOne-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=findtheone-backend

Environment=SPRING_PROFILES_ACTIVE=prod
Environment=DB_PASSWORD=FindTheOne2024App!
Environment=JWT_SECRET=findtheone-secret-key-for-jwt-token-generation-should-be-at-least-256-bits

[Install]
WantedBy=multi-user.target
EOF

# Set ownership
chown -R findtheone:findtheone $PROJECT_DIR

# Reload systemd and start services
print_status "Starting services..."
systemctl daemon-reload

# Start and enable services
systemctl enable findtheone-backend
systemctl start findtheone-backend

systemctl enable nginx
systemctl restart nginx

print_status "Deployment completed successfully!"
echo ""
echo -e "${GREEN}=== FindTheOne Deployment Summary ===${NC}"
echo -e "${BLUE}Frontend URL:${NC} http://$INSTANCE_IP"
echo -e "${BLUE}Backend API:${NC} http://$INSTANCE_IP:8091/api"
echo -e "${BLUE}Instance IP:${NC} $INSTANCE_IP"
echo ""
echo -e "${YELLOW}Service Status:${NC}"
systemctl status findtheone-backend --no-pager -l
echo ""
systemctl status nginx --no-pager -l
echo ""
echo -e "${GREEN}Deployment completed at $(date)${NC}"

# Check if services are running
sleep 5
if systemctl is-active --quiet findtheone-backend; then
    print_status "Backend service is running successfully"
else
    print_error "Backend service failed to start. Check logs with: journalctl -u findtheone-backend -f"
fi

if systemctl is-active --quiet nginx; then
    print_status "Nginx service is running successfully"
else
    print_error "Nginx service failed to start. Check logs with: journalctl -u nginx -f"
fi

print_status "You can check the application logs with:"
echo "  Backend: journalctl -u findtheone-backend -f"
echo "  Nginx: journalctl -u nginx -f"
