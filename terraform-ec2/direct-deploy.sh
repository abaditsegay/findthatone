#!/bin/bash

# AWS CLI Direct Deployment Script for FindTheOne
# This script deploys the EC2 infrastructure directly using AWS CLI

set -e

echo "🚀 Starting FindTheOne deployment using AWS CLI..."

# Configuration
REGION="us-east-1"
VPC_CIDR="10.0.0.0/16"
SUBNET_CIDR="10.0.1.0/24"
INSTANCE_TYPE="t3.medium"
KEY_NAME="findthatone-keypair"
PROJECT_NAME="findtheone"

# Create VPC
echo "📡 Creating VPC..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block $VPC_CIDR \
    --query 'Vpc.VpcId' \
    --output text \
    --region $REGION)

echo "VPC created: $VPC_ID"

# Tag VPC
aws ec2 create-tags \
    --resources $VPC_ID \
    --tags Key=Name,Value="$PROJECT_NAME-vpc" Key=Project,Value="$PROJECT_NAME" \
    --region $REGION

# Enable DNS support
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames

# Create Internet Gateway
echo "🌐 Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
    --query 'InternetGateway.InternetGatewayId' \
    --output text \
    --region $REGION)

echo "Internet Gateway created: $IGW_ID"

# Tag IGW
aws ec2 create-tags \
    --resources $IGW_ID \
    --tags Key=Name,Value="$PROJECT_NAME-igw" Key=Project,Value="$PROJECT_NAME" \
    --region $REGION

# Attach IGW to VPC
aws ec2 attach-internet-gateway \
    --internet-gateway-id $IGW_ID \
    --vpc-id $VPC_ID \
    --region $REGION

# Get first availability zone
AZ=$(aws ec2 describe-availability-zones \
    --query 'AvailabilityZones[0].ZoneName' \
    --output text \
    --region $REGION)

echo "Using availability zone: $AZ"

# Create public subnet
echo "🏗️ Creating public subnet..."
SUBNET_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block $SUBNET_CIDR \
    --availability-zone $AZ \
    --query 'Subnet.SubnetId' \
    --output text \
    --region $REGION)

echo "Subnet created: $SUBNET_ID"

# Tag subnet
aws ec2 create-tags \
    --resources $SUBNET_ID \
    --tags Key=Name,Value="$PROJECT_NAME-public-subnet" Key=Project,Value="$PROJECT_NAME" \
    --region $REGION

# Enable auto-assign public IP
aws ec2 modify-subnet-attribute \
    --subnet-id $SUBNET_ID \
    --map-public-ip-on-launch \
    --region $REGION

# Create route table
echo "🛣️ Creating route table..."
RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --query 'RouteTable.RouteTableId' \
    --output text \
    --region $REGION)

echo "Route table created: $RT_ID"

# Tag route table
aws ec2 create-tags \
    --resources $RT_ID \
    --tags Key=Name,Value="$PROJECT_NAME-public-rt" Key=Project,Value="$PROJECT_NAME" \
    --region $REGION

# Create route to IGW
aws ec2 create-route \
    --route-table-id $RT_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID \
    --region $REGION

# Associate route table with subnet
aws ec2 associate-route-table \
    --route-table-id $RT_ID \
    --subnet-id $SUBNET_ID \
    --region $REGION

# Create security group
echo "🔒 Creating security group..."
SG_ID=$(aws ec2 create-security-group \
    --group-name "$PROJECT_NAME-sg" \
    --description "Security group for FindTheOne application" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text \
    --region $REGION)

echo "Security group created: $SG_ID"

# Tag security group
aws ec2 create-tags \
    --resources $SG_ID \
    --tags Key=Name,Value="$PROJECT_NAME-sg" Key=Project,Value="$PROJECT_NAME" \
    --region $REGION

# Add security group rules
echo "🔐 Adding security group rules..."

# SSH
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0 \
    --region $REGION

# HTTP
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $REGION

# HTTPS
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $REGION

# Backend API
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 8091 \
    --cidr 0.0.0.0/0 \
    --region $REGION

# MySQL (internal)
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3306 \
    --cidr $VPC_CIDR \
    --region $REGION

# Get latest Ubuntu 22.04 AMI
echo "🖼️ Finding latest Ubuntu 22.04 AMI..."
AMI_ID=$(aws ec2 describe-images \
    --owners 099720109477 \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
              "Name=state,Values=available" \
    --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
    --output text \
    --region $REGION)

echo "Using AMI: $AMI_ID"

# Create user data script
cat > user-data-temp.sh << 'EOF'
#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log) 2>&1

echo "Starting FindTheOne deployment at $(date)"

# Update system
apt-get update
apt-get upgrade -y

# Install packages
apt-get install -y curl wget unzip git nginx mysql-server openjdk-21-jdk maven awscli

# Set JAVA_HOME
echo "export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64" >> /etc/environment
echo "export PATH=\$PATH:\$JAVA_HOME/bin" >> /etc/environment
source /etc/environment

# Configure MySQL
systemctl start mysql
systemctl enable mysql

# Set MySQL password and create database
mysql -u root <<EOSQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'FindTheOne2024App!';
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS findtheone;
CREATE USER IF NOT EXISTS 'findtheone'@'localhost' IDENTIFIED BY 'FindTheOne2024App!';
GRANT ALL PRIVILEGES ON findtheone.* TO 'findtheone'@'localhost';
FLUSH PRIVILEGES;
EOSQL

# Create directories
mkdir -p /opt/findtheone/backend
mkdir -p /opt/findtheone/frontend
mkdir -p /var/log/findtheone
chown -R ubuntu:ubuntu /opt/findtheone
chown -R ubuntu:ubuntu /var/log/findtheone

# Configure Nginx
cat > /etc/nginx/sites-available/findtheone <<NGINXCONF
server {
    listen 80;
    server_name _;

    location / {
        root /opt/findtheone/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8091/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
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
}
NGINXCONF

ln -sf /etc/nginx/sites-available/findtheone /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

# Create systemd service
cat > /etc/systemd/system/findtheone-backend.service <<SERVICECONF
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
Environment=SPRING_DATASOURCE_PASSWORD=FindTheOne2024App!
Environment=JWT_SECRET=findtheone-secret-key-for-jwt-token-generation-should-be-at-least-256-bits
Environment=UPLOAD_DIR=/opt/findtheone/backend/uploads

[Install]
WantedBy=multi-user.target
SERVICECONF

systemctl daemon-reload
systemctl enable findtheone-backend

echo "User data script completed at $(date)"
EOF

# Launch EC2 instance
echo "🚀 Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --count 1 \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SG_ID \
    --subnet-id $SUBNET_ID \
    --user-data file://user-data-temp.sh \
    --block-device-mappings DeviceName=/dev/sda1,Ebs='{VolumeSize=20,VolumeType=gp3,DeleteOnTermination=true,Encrypted=true}' \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$PROJECT_NAME-instance},{Key=Project,Value=$PROJECT_NAME}]" \
    --query 'Instances[0].InstanceId' \
    --output text \
    --region $REGION)

echo "Instance launched: $INSTANCE_ID"

# Wait for instance to be running
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Allocate and associate Elastic IP
echo "🌍 Allocating Elastic IP..."
EIP_ALLOC=$(aws ec2 allocate-address \
    --domain vpc \
    --query 'AllocationId' \
    --output text \
    --region $REGION)

echo "Elastic IP allocated: $EIP_ALLOC"

# Tag EIP
aws ec2 create-tags \
    --resources $EIP_ALLOC \
    --tags Key=Name,Value="$PROJECT_NAME-eip" Key=Project,Value="$PROJECT_NAME" \
    --region $REGION

# Associate EIP with instance
aws ec2 associate-address \
    --instance-id $INSTANCE_ID \
    --allocation-id $EIP_ALLOC \
    --region $REGION

# Get the public IP
PUBLIC_IP=$(aws ec2 describe-addresses \
    --allocation-ids $EIP_ALLOC \
    --query 'Addresses[0].PublicIp' \
    --output text \
    --region $REGION)

echo "✅ Instance deployed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "VPC ID: $VPC_ID"
echo "Subnet ID: $SUBNET_ID"
echo "Security Group ID: $SG_ID"
echo ""
echo "🔗 Connection Info:"
echo "SSH: ssh -i ~/.ssh/$KEY_NAME ubuntu@$PUBLIC_IP"
echo "Frontend: http://$PUBLIC_IP"
echo "Backend API: http://$PUBLIC_IP:8091/api"
echo ""
echo "⏳ Please wait 5-10 minutes for the user-data script to complete installation"
echo "💡 You can monitor progress with: ssh -i ~/.ssh/$KEY_NAME ubuntu@$PUBLIC_IP 'tail -f /var/log/user-data.log'"

# Save deployment info
cat > deployment-info.txt << EOF
Deployment completed at: $(date)
Instance ID: $INSTANCE_ID
Public IP: $PUBLIC_IP
VPC ID: $VPC_ID
Subnet ID: $SUBNET_ID
Security Group ID: $SG_ID
Elastic IP Allocation: $EIP_ALLOC

SSH Command: ssh -i ~/.ssh/$KEY_NAME ubuntu@$PUBLIC_IP
Frontend URL: http://$PUBLIC_IP
Backend API: http://$PUBLIC_IP:8091/api
Health Check: http://$PUBLIC_IP:8091/api/test

Monitoring Commands:
- Check user-data progress: ssh -i ~/.ssh/$KEY_NAME ubuntu@$PUBLIC_IP 'tail -f /var/log/user-data.log'
- Check backend service: ssh -i ~/.ssh/$KEY_NAME ubuntu@$PUBLIC_IP 'sudo systemctl status findtheone-backend'
- Check backend logs: ssh -i ~/.ssh/$KEY_NAME ubuntu@$PUBLIC_IP 'sudo journalctl -u findtheone-backend -f'
EOF

echo "📄 Deployment info saved to deployment-info.txt"

# Clean up temp files
rm -f user-data-temp.sh

echo "🎉 Deployment complete! Check deployment-info.txt for details."
