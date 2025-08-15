#!/bin/bash

# Exit on any error
set -e

# Log everything
exec > >(tee /var/log/user-data.log) 2>&1

echo "Starting FindTheOne deployment at $(date)"

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    nginx \
    mysql-server \
    openjdk-21-jdk \
    maven \
    awscli

# Set JAVA_HOME
echo "export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64" >> /etc/environment
echo "export PATH=\$PATH:\$JAVA_HOME/bin" >> /etc/environment
source /etc/environment

# Configure MySQL
echo "Configuring MySQL..."
systemctl start mysql
systemctl enable mysql

# Set MySQL root password and create database
mysql -u root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${db_password}';
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS findtheone;
CREATE USER IF NOT EXISTS 'findtheone'@'localhost' IDENTIFIED BY '${db_password}';
GRANT ALL PRIVILEGES ON findtheone.* TO 'findtheone'@'localhost';
FLUSH PRIVILEGES;
EOF

# Create application directory
echo "Creating application directories..."
mkdir -p /opt/findtheone/backend
mkdir -p /opt/findtheone/frontend
mkdir -p /var/log/findtheone
chown -R ubuntu:ubuntu /opt/findtheone
chown -R ubuntu:ubuntu /var/log/findtheone

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/findtheone <<EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /opt/findtheone/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8091/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
        
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # WebSocket for real-time features
    location /ws/ {
        proxy_pass http://localhost:8091/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/findtheone /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl enable nginx
systemctl restart nginx

# Create systemd service for backend
echo "Creating systemd service for backend..."
cat > /etc/systemd/system/findtheone-backend.service <<EOF
[Unit]
Description=FindTheOne Backend Application
After=network.target mysql.service
Requires=mysql.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/findtheone/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=aws /opt/findtheone/backend/target/findtheone-backend-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/var/log/findtheone/backend.log
StandardError=append:/var/log/findtheone/backend-error.log

Environment=SPRING_PROFILES_ACTIVE=aws
Environment=SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/findtheone
Environment=SPRING_DATASOURCE_USERNAME=findtheone
Environment=SPRING_DATASOURCE_PASSWORD=${db_password}
Environment=JWT_SECRET=${jwt_secret}
Environment=UPLOAD_DIR=/opt/findtheone/backend/uploads

[Install]
WantedBy=multi-user.target
EOF

# Enable the service (but don't start it yet - will be started by deployment script)
systemctl daemon-reload
systemctl enable findtheone-backend

echo "User data script completed successfully at $(date)"
echo "Instance is ready for application deployment"
