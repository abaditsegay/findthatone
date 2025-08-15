# FindTheOne AWS EC2 Deployment

This directory contains Terraform configuration and deployment scripts to deploy the FindTheOne dating application on a single AWS EC2 instance without Docker, load balancers, or ECS.

## Architecture

- **Single EC2 Instance**: t3.medium (Ubuntu 22.04)
- **Backend**: Spring Boot application (Java 21) running on port 8091
- **Frontend**: React application served by Nginx on port 80
- **Database**: MySQL 8.0 running directly on the instance
- **Reverse Proxy**: Nginx for serving frontend and proxying API requests

## Prerequisites

1. **AWS CLI** installed and configured with appropriate credentials
2. **Terraform** (>= 1.0) installed
3. **SSH** client available

### AWS Permissions Required

Your AWS user/role needs the following permissions:
- EC2 full access (create/manage instances, security groups, key pairs)
- VPC full access (create/manage VPCs, subnets, internet gateways)
- Elastic IP management

## Quick Start

### 1. Setup

```bash
cd terraform-ec2

# Make scripts executable
chmod +x *.sh

# Run the full deployment (this will create infrastructure and deploy the app)
./deploy-full.sh
```

The `deploy-full.sh` script will:
- Check prerequisites
- Create SSH key pair if needed
- Create `terraform.tfvars` file
- Deploy infrastructure with Terraform
- Deploy the application to the EC2 instance

### 2. Manual Step-by-Step Deployment

If you prefer manual control:

#### Step 1: Configure Variables

```bash
# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
nano terraform.tfvars
```

Add your SSH public key:
```bash
# If you don't have an SSH key, create one:
ssh-keygen -t rsa -b 4096 -f ~/.ssh/findtheone-keypair

# Then add the public key content to terraform.tfvars
cat ~/.ssh/findtheone-keypair.pub
```

#### Step 2: Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the configuration
terraform apply
```

#### Step 3: Deploy Application

```bash
# Get the instance IP
INSTANCE_IP=$(terraform output -raw instance_public_ip)

# Copy deployment script to instance
scp -i ~/.ssh/findtheone-keypair deploy.sh ubuntu@$INSTANCE_IP:/tmp/

# Run deployment script
ssh -i ~/.ssh/findtheone-keypair ubuntu@$INSTANCE_IP "sudo bash /tmp/deploy.sh"
```

## Configuration

### Terraform Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `aws_region` | AWS region for deployment | `us-east-1` |
| `project_name` | Project name for resource naming | `findtheone` |
| `environment` | Environment name | `production` |
| `instance_type` | EC2 instance type | `t3.medium` |
| `ssh_public_key` | SSH public key for access | **Required** |
| `mysql_root_password` | MySQL root password | `FindTheOne2024Root!` |
| `app_db_password` | Application DB password | `FindTheOne2024App!` |
| `jwt_secret` | JWT secret key | Auto-generated |

### Application Configuration

The deployment script automatically configures:
- MySQL database with application user and database
- Spring Boot backend with production settings
- React frontend with correct API endpoints
- Nginx reverse proxy configuration
- Systemd services for auto-start

## Accessing the Application

After deployment:

```bash
# Get connection information
terraform output

# Access the application
INSTANCE_IP=$(terraform output -raw instance_public_ip)
echo "Frontend: http://$INSTANCE_IP"
echo "Backend API: http://$INSTANCE_IP:8091/api"

# SSH to instance
ssh -i ~/.ssh/findtheone-keypair ubuntu@$INSTANCE_IP
```

## Monitoring and Troubleshooting

### Service Status

```bash
# Check backend service
sudo systemctl status findtheone-backend

# Check Nginx
sudo systemctl status nginx

# Check MySQL
sudo systemctl status mysql
```

### Logs

```bash
# Backend logs
sudo journalctl -u findtheone-backend -f

# Nginx logs
sudo journalctl -u nginx -f
sudo tail -f /var/log/nginx/error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log

# Application logs
tail -f /opt/findtheone/logs/application.log
```

### Common Issues

1. **Backend not starting**:
   ```bash
   # Check Java version
   java -version
   
   # Check if port is available
   sudo netstat -tlnp | grep :8091
   
   # Restart backend service
   sudo systemctl restart findtheone-backend
   ```

2. **Frontend not accessible**:
   ```bash
   # Check Nginx configuration
   sudo nginx -t
   
   # Restart Nginx
   sudo systemctl restart nginx
   ```

3. **Database connection issues**:
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Test database connection
   mysql -u findtheone_user -p findtheone_db
   ```

## Updating the Application

To update the application code:

```bash
# SSH to instance
ssh -i ~/.ssh/findtheone-keypair ubuntu@$INSTANCE_IP

# Update repository
cd /opt/findtheone/findthatone
sudo git pull origin master

# Rebuild and restart backend
cd /opt/findtheone/backend
sudo ./mvnw clean package -DskipTests
sudo systemctl restart findtheone-backend

# Rebuild and deploy frontend
cd /opt/findtheone/frontend
sudo npm run build
sudo systemctl reload nginx
```

## Security Considerations

- The instance allows SSH access from anywhere (0.0.0.0/0) - consider restricting to your IP
- MySQL is configured for local connections only
- All passwords should be changed from defaults
- Consider enabling SSL/HTTPS for production use
- Regular security updates should be applied

## Cleanup

To destroy all resources:

```bash
./cleanup.sh
```

Or manually:

```bash
terraform destroy
```

## File Structure

```
terraform-ec2/
├── main.tf                 # Main Terraform configuration
├── variables.tf            # Variable definitions
├── outputs.tf             # Output definitions
├── user-data.sh           # EC2 initialization script
├── deploy.sh              # Application deployment script
├── deploy-full.sh         # Full automation script
├── cleanup.sh             # Resource cleanup script
├── terraform.tfvars.example # Example variables file
└── README.md              # This file
```

## Costs

Estimated monthly costs for t3.medium in us-east-1:
- EC2 instance: ~$30-40/month
- EBS storage (30GB): ~$3/month
- Elastic IP: ~$3.65/month (if not attached to running instance)
- Data transfer: Variable based on usage

**Total estimated cost: ~$35-45/month**

## Support

For issues related to:
- **Infrastructure/Deployment**: Check this README and Terraform documentation
- **Application Issues**: Check the main FindTheOne repository
- **AWS-specific Issues**: Consult AWS documentation

## License

This deployment configuration is part of the FindTheOne project.
