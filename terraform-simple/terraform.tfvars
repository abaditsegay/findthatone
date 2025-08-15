# Example Terraform variables file
# Copy this to terraform.tfvars and update with your values

# AWS Configuration
aws_region = "us-east-1"

# Project Configuration
project_name = "findtheone"

# SSH Configuration
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDRndX7ebNCol9sZK7gbBIo5FWrW9oLYdoWHi3vZpiCCBk0GjdBVBpgRN9xIvdXGyOl24gf4rODeQyy8+4mci6X9Bf2BqUKp+MVpUgRhgo1umzchaY+RUNGavFOvAixio0fHZ4gFN3YOiM/ZE53aldGGf+a3jy0mwKZYuCv9RzYnP1+TQYpZekB+90IA2MtH5Z5JFlKusKxzp/h8exUT5uut88LTCvWMiVpcWpHrdQC6TM5CivQZ7qTReL9I4hVF8KIuV/g3UANLeN1EHpZxbD0ae+TbloFX/mgvGxVYvO5PrysIHaQ8rMNvkYr95YSy+opr7THeIN3svkiSWKn1r2H samuel@Mac"

# Database Configuration
db_username = "admin"
db_password = "FindTheOne2024!SecureDB"

# JWT Configuration (minimum 32 characters)
jwt_secret = "FindTheOneSecureJWTKey123456789012345678901234567890"

# Email Configuration (Office 365)
mail_password = "your-office365-email-password-here"

# Docker Images (update these after building and pushing to ECR or Docker Hub)
backend_image_tag  = "539247447347.dkr.ecr.us-east-1.amazonaws.com/findtheone-backend:latest"
frontend_image_tag = "539247447347.dkr.ecr.us-east-1.amazonaws.com/findtheone-frontend:latest"

# SSL Certificate (optional - leave empty to use ALB default certificate)
# ssl_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012"
ssl_certificate_arn = ""

# OAuth2 Configuration for Email Service (Office 365)
oauth2_client_id     = "your-oauth2-client-id"
oauth2_client_secret = "your-oauth2-client-secret"
oauth2_tenant_id     = "your-oauth2-tenant-id"
