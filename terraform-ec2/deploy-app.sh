#!/bin/bash

# Application Deployment Script for AWS EC2
# Run this after the infrastructure is ready

set -e

PUBLIC_IP="18.215.217.246"
SSH_KEY="~/.ssh/findthatone-keypair"

echo "🚀 Deploying FindTheOne application to $PUBLIC_IP"

# Wait for instance to be ready
echo "⏳ Checking if instance is ready..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "echo 'Instance is accessible'"

# Build backend locally
echo "🏗️ Building backend..."
cd /Users/samuel/Projects2/FindTheOne/backend
./mvnw clean package -DskipTests

# Build frontend locally  
echo "🏗️ Building frontend..."
cd /Users/samuel/Projects2/FindTheOne/frontend
REACT_APP_API_URL=http://$PUBLIC_IP:8091/api \
REACT_APP_BACKEND_URL=http://$PUBLIC_IP:8091 \
GENERATE_SOURCEMAP=false \
REACT_APP_ENVIRONMENT=production \
npm run build

# Upload backend
echo "📤 Uploading backend..."
scp -i $SSH_KEY -r /Users/samuel/Projects2/FindTheOne/backend/target ubuntu@$PUBLIC_IP:/opt/findtheone/backend/

# Upload frontend
echo "📤 Uploading frontend..."
scp -i $SSH_KEY -r /Users/samuel/Projects2/FindTheOne/frontend/build/* ubuntu@$PUBLIC_IP:/opt/findtheone/frontend/

# Create uploads directory
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "mkdir -p /opt/findtheone/backend/uploads/photos"

# Start backend service
echo "🎬 Starting backend service..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo systemctl start findtheone-backend"
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo systemctl enable findtheone-backend"

# Wait a moment for service to start
sleep 10

# Check service status
echo "🔍 Checking service status..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo systemctl status findtheone-backend --no-pager"

echo "✅ Application deployment complete!"
echo ""
echo "🌐 Your application is now available at:"
echo "Frontend: http://$PUBLIC_IP"
echo "Backend API: http://$PUBLIC_IP:8091/api"
echo ""
echo "🔍 Monitoring commands:"
echo "Backend logs: ssh -i $SSH_KEY ubuntu@$PUBLIC_IP 'sudo journalctl -u findtheone-backend -f'"
echo "Backend status: ssh -i $SSH_KEY ubuntu@$PUBLIC_IP 'sudo systemctl status findtheone-backend'"
echo "Test API: curl http://$PUBLIC_IP:8091/api/test"
