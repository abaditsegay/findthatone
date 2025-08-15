aws_region = "us-east-1"
project_name = "findtheone"
environment = "production"
instance_type = "t3.medium"

# SSH key pair name (existing key pair in AWS)
key_pair_name = "findthatone-keypair"

# Network configuration
vpc_cidr = "10.0.0.0/16"
public_subnet_cidr = "10.0.1.0/24"

# Storage configuration
root_volume_size = 20

# Database passwords (change these for production)
db_password = "FindTheOne2024App!"

# JWT secret key
jwt_secret = "findtheone-secret-key-for-jwt-token-generation-should-be-at-least-256-bits-long"
