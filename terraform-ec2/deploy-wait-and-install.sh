#!/bin/bash

# Simple deployment script that waits for the instance to be ready
# and then deploys the application with frontend on port 3000

set -e

PUBLIC_IP="18.215.217.246"
SSH_KEY="~/.ssh/findthatone-keypair"

echo "🚀 Waiting for instance to be ready and deploying FindTheOne (Frontend on port 3000)"

# Function to check if instance is ready
check_instance_ready() {
    ssh -i $SSH_KEY -o ConnectTimeout=5 -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "ls > /dev/null 2>&1"
    return $?
}

# Wait for instance to be ready
echo "⏳ Waiting for instance to be fully ready (this may take 5-10 minutes)..."
RETRY_COUNT=0
MAX_RETRIES=60
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if check_instance_ready; then
        echo "✅ Instance is ready!"
        break
    else
        echo "⏳ Instance still booting... (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
        sleep 30
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Instance didn't become ready in time. Please check the instance manually."
    exit 1
fi

# Check if user-data script has completed
echo "🔍 Checking if setup is complete..."
while true; do
    if ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "test -f /var/log/user-data.log && grep -q 'User data script completed' /var/log/user-data.log"; then
        echo "✅ Server setup is complete!"
        break
    else
        echo "⏳ Server setup still in progress..."
        sleep 30
    fi
done

# Now deploy the application
echo "🏗️ Building backend locally..."
cd /Users/samuel/Projects2/FindTheOne/backend
./mvnw clean package -DskipTests

echo "📤 Uploading backend..."
scp -i $SSH_KEY -r /Users/samuel/Projects2/FindTheOne/backend/target ubuntu@$PUBLIC_IP:/opt/findtheone/backend/

echo "📤 Uploading frontend source..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "mkdir -p /opt/findtheone/frontend-source"
scp -i $SSH_KEY -r /Users/samuel/Projects2/FindTheOne/frontend/* ubuntu@$PUBLIC_IP:/opt/findtheone/frontend-source/

echo "📦 Installing Node.js and setting up frontend..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "
cd /opt/findtheone/frontend-source
sudo chown -R ubuntu:ubuntu /opt/findtheone/frontend-source
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install
"

echo "🎬 Starting backend service..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "
sudo systemctl start findtheone-backend
sudo systemctl enable findtheone-backend
"

echo "🌐 Creating frontend service for port 3000..."
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

echo "🚀 Starting frontend service..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "
sudo systemctl daemon-reload
sudo systemctl enable findtheone-frontend
sudo systemctl start findtheone-frontend
"

echo "⏳ Waiting for services to start..."
sleep 20

echo "🔍 Checking service status..."
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo systemctl status findtheone-backend --no-pager || true"
ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "sudo systemctl status findtheone-frontend --no-pager || true"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application is now available at:"
echo "Frontend: http://$PUBLIC_IP:3000"
echo "Backend API: http://$PUBLIC_IP:8091/api"
echo ""
echo "🔍 Useful commands:"
echo "Check frontend logs: ssh -i $SSH_KEY ubuntu@$PUBLIC_IP 'sudo journalctl -u findtheone-frontend -f'"
echo "Check backend logs: ssh -i $SSH_KEY ubuntu@$PUBLIC_IP 'sudo journalctl -u findtheone-backend -f'"
echo "Test frontend: curl http://$PUBLIC_IP:3000"
echo "Test backend: curl http://$PUBLIC_IP:8091/api/test"
