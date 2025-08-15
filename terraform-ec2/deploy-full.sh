#!/bin/bash

# Full deployment automation script for FindTheOne
# This script will create infrastructure and deploy the application

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_status "All requirements satisfied"
}

# Setup SSH key if it doesn't exist
setup_ssh_key() {
    local key_name="findtheone-keypair"
    local key_path="$HOME/.ssh/$key_name"
    
    if [ ! -f "$key_path" ]; then
        print_status "Creating SSH key pair..."
        ssh-keygen -t rsa -b 4096 -f "$key_path" -N "" -C "findtheone-deployment"
        chmod 400 "$key_path"
        print_status "SSH key created at $key_path"
    else
        print_status "SSH key already exists at $key_path"
    fi
    
    # Return the public key content
    cat "${key_path}.pub"
}

# Create terraform.tfvars if it doesn't exist
setup_terraform_vars() {
    if [ ! -f "terraform.tfvars" ]; then
        print_status "Creating terraform.tfvars..."
        local ssh_public_key=$(setup_ssh_key)
        
        cat > terraform.tfvars << EOF
aws_region = "us-east-1"
project_name = "findtheone"
environment = "production"
instance_type = "t3.medium"
ssh_public_key = "$ssh_public_key"
mysql_root_password = "FindTheOne2024Root!"
app_db_password = "FindTheOne2024App!"
jwt_secret = "findtheone-secret-key-for-jwt-token-generation-should-be-at-least-256-bits"
EOF
        print_status "terraform.tfvars created"
    else
        print_status "terraform.tfvars already exists"
    fi
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    terraform init
    terraform plan
    
    echo -e "${YELLOW}Do you want to apply this Terraform plan? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        terraform apply -auto-approve
        print_status "Infrastructure deployed successfully"
    else
        print_error "Deployment cancelled"
        exit 1
    fi
}

# Deploy application
deploy_application() {
    print_status "Getting instance information..."
    
    local instance_ip=$(terraform output -raw instance_public_ip)
    local ssh_command=$(terraform output -raw ssh_command)
    
    print_status "Instance IP: $instance_ip"
    print_status "Waiting for instance to be ready..."
    
    # Wait for SSH to be available
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if ssh -i ~/.ssh/findtheone-keypair -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@$instance_ip "echo 'SSH Ready'" &> /dev/null; then
            print_status "SSH connection established"
            break
        fi
        
        print_status "Attempt $attempt/$max_attempts - Waiting for SSH..."
        sleep 10
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Could not establish SSH connection after $max_attempts attempts"
        exit 1
    fi
    
    # Copy deployment script to instance
    print_status "Copying deployment script to instance..."
    scp -i ~/.ssh/findtheone-keypair -o StrictHostKeyChecking=no deploy.sh ubuntu@$instance_ip:/tmp/
    
    # Run deployment script
    print_status "Running deployment script on instance..."
    ssh -i ~/.ssh/findtheone-keypair -o StrictHostKeyChecking=no ubuntu@$instance_ip "sudo bash /tmp/deploy.sh"
    
    print_status "Application deployment completed!"
}

# Main execution
main() {
    echo -e "${BLUE}Starting FindTheOne Full Deployment...${NC}"
    
    check_requirements
    setup_terraform_vars
    deploy_infrastructure
    deploy_application
    
    # Show final information
    local instance_ip=$(terraform output -raw instance_public_ip)
    local frontend_url=$(terraform output -raw frontend_url)
    local backend_url=$(terraform output -raw backend_api_url)
    
    echo ""
    echo -e "${GREEN}=== Deployment Completed Successfully! ===${NC}"
    echo -e "${BLUE}Frontend URL:${NC} $frontend_url"
    echo -e "${BLUE}Backend API:${NC} $backend_url"
    echo -e "${BLUE}Instance IP:${NC} $instance_ip"
    echo -e "${BLUE}SSH Command:${NC} ssh -i ~/.ssh/findtheone-keypair ubuntu@$instance_ip"
    echo ""
    echo -e "${YELLOW}Note: It may take a few minutes for the application to fully start.${NC}"
    echo -e "${YELLOW}You can monitor the deployment with:${NC}"
    echo -e "${YELLOW}  ssh -i ~/.ssh/findtheone-keypair ubuntu@$instance_ip 'sudo journalctl -u findtheone-backend -f'${NC}"
}

# Check if we're in the right directory
if [ ! -f "main.tf" ]; then
    print_error "Please run this script from the terraform-ec2 directory"
    exit 1
fi

# Run main function
main "$@"
