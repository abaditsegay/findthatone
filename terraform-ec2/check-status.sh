#!/bin/bash

PUBLIC_IP="18.215.217.246"
SSH_KEY="~/.ssh/findthatone-keypair"

echo "🔍 Checking instance status..."

# Check if we can connect
if ssh -i $SSH_KEY -o ConnectTimeout=5 -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "echo 'Connected successfully'" 2>/dev/null; then
    echo "✅ SSH connection successful"
    
    # Check if user-data is still running
    echo "📋 Checking user-data progress..."
    ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "ps aux | grep -v grep | grep -q cloud-init" && echo "⏳ cloud-init still running" || echo "✅ cloud-init completed"
    
    # Check if log file exists and show last few lines
    if ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "test -f /var/log/user-data.log"; then
        echo "📄 Last 10 lines of user-data.log:"
        ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "tail -10 /var/log/user-data.log"
    else
        echo "❌ user-data.log not found yet"
    fi
    
    # Check system status
    echo "💻 System load:"
    ssh -i $SSH_KEY ubuntu@$PUBLIC_IP "uptime"
    
else
    echo "❌ Cannot connect to instance yet"
fi
