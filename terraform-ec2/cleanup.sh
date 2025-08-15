#!/bin/bash

# Cleanup script for FindTheOne deployment
# This script will destroy all AWS resources created by Terraform

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

# Check if we're in the right directory
if [ ! -f "main.tf" ]; then
    print_error "Please run this script from the terraform-ec2 directory"
    exit 1
fi

# Show what will be destroyed
print_status "Showing resources that will be destroyed..."
terraform plan -destroy

echo ""
echo -e "${RED}WARNING: This will destroy all AWS resources created by this deployment!${NC}"
echo -e "${RED}This action cannot be undone!${NC}"
echo ""
echo -e "${YELLOW}Are you sure you want to destroy all resources? (yes/no)${NC}"
read -r response

if [[ "$response" == "yes" ]]; then
    print_status "Destroying infrastructure..."
    terraform destroy -auto-approve
    print_status "All resources have been destroyed successfully"
    
    # Optionally remove SSH key
    echo -e "${YELLOW}Do you want to remove the SSH key as well? (y/n)${NC}"
    read -r ssh_response
    if [[ "$ssh_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        rm -f ~/.ssh/findtheone-keypair ~/.ssh/findtheone-keypair.pub
        print_status "SSH key removed"
    fi
    
    echo -e "${GREEN}Cleanup completed successfully!${NC}"
else
    print_status "Cleanup cancelled"
fi
