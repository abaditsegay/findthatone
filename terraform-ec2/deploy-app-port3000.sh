#!/bin/bash

# Application Deployment Script for AWS EC2 - Frontend on Port 3000
# Run this after the infrastructure is ready

set -e

PUBLIC_IP="18.215.217.246"
SSH_KEY="~/.ssh/findthatone-keypair"

echo "🚀 Deploying FindTheOne application to $PUBLIC_IP (Frontend on port 3000)"

# Wait for instance to be ready
echo "⏳ Checking if instance is ready..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "echo 'Instance is accessible'"

# Build backend locally
echo "🏗️ Building backend..."
cd /Users/samuel/Projects2/FindTheOne/backend
./mvnw clean package -DskipTests

# Upload backend
echo "📤 Uploading backend..."
scp -i $SSH_KEY -r /Users/samuel/Projects2/FindTheOne/backend/target ubuntu@$PUBLIC_IP:/opt/findtheone/backend/

# Upload frontend source (we'll run it with npm start on the server)
echo "📤 Uploading frontend source..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "mkdir -p /opt/findtheone/frontend-source"
scp -i $SSH_KEY -r /Users/samuel/Projects2/FindTheOne/frontend/* ubuntu@$PUBLIC_IP:/opt/findtheone/frontend-source/

# Install Node.js and npm on the server
echo "📦 Installing Node.js and npm on server..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "
sudo apt-get update
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
"

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "
cd /opt/findtheone/frontend-source
sudo chown -R ubuntu:ubuntu /opt/findtheone/frontend-source
npm install
"

# Create uploads directory
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "mkdir -p /opt/findtheone/backend/uploads/photos"

# Start backend service
echo "🎬 Starting backend service..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo systemctl start findtheone-backend"
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo systemctl enable findtheone-backend"

# Create systemd service for frontend
echo "🌐 Creating frontend service..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo tee /etc/systemd/system/findtheone-frontend.service > /dev/null << 'EOF'
[Unit]
Description=FindTheOne Frontend Application
After=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/findtheone/frontend-source
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=append:/var/log/findtheone/frontend.log
StandardError=append:/var/log/findtheone/frontend-error.log

Environment=REACT_APP_API_URL=http://$PUBLIC_IP:8091/api
Environment=REACT_APP_BACKEND_URL=http://$PUBLIC_IP:8091
Environment=REACT_APP_ENVIRONMENT=production
Environment=PORT=3000
Environment=HOST=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF"

# Reload systemd and start frontend service
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "
sudo systemctl daemon-reload
sudo systemctl enable findtheone-frontend
sudo systemctl start findtheone-frontend
"

# Wait a moment for services to start
sleep 15

# Check service status
echo "🔍 Checking service status..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo systemctl status findtheone-backend --no-pager"
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo systemctl status findtheone-frontend --no-pager"

echo "✅ Application deployment complete!"
echo ""
echo "🌐 Your application is now available at:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:8091/api"
echo ""
echo "🔍 Monitoring commands:"
echo "Backend logs: ssh -i $SSH_KEY ubuntu@$PUBLIC_IP 'sudo journalctl -u findtheone-backend -f'"
echo "Frontend logs: ssh -i $SSH_KEY ubuntu@$PUBLIC_IP 'sudo journalctl -u findtheone-frontend -f'"
echo "Backend status: ssh -i $SSH_KEY ubuntu@$PUBLIC_IP 'sudo systemctl status findtheone-backend'"
echo "Frontend status: ssh -i $SSH_KEY ubuntu@$PUBLIC_IP 'sudo systemctl status findtheone-frontend'"
echo "Test API: curl http://$PUBLIC_IP:8091/api/test"
echo "Test Frontend: curl http://$PUBLIC_IP:3000"
