# FindThatOne Web Application Deployment on AWS EC2
# Simple configuration with frontend, backend, and MySQL database

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
}

# Data source to get the latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-*-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# Create VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = "production"
    Project     = var.project_name
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-igw"
    Environment = "production"
    Project     = var.project_name
  }
}

# Create public subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-public-subnet"
    Environment = "production"
    Project     = var.project_name
  }
}

# Create route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-public-rt"
    Environment = "production"
    Project     = var.project_name
  }
}

# Associate route table with subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Create security group
resource "aws_security_group" "web_app" {
  name_prefix = "${var.project_name}-"
  vpc_id      = aws_vpc.main.id

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend (React)
  ingress {
    description = "Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend (Spring Boot)
  ingress {
    description = "Backend"
    from_port   = 8091
    to_port     = 8091
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # MySQL (for local access if needed)
  ingress {
    description = "MySQL"
    from_port   = 3307
    to_port     = 3307
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-sg"
    Environment = "production"
    Project     = var.project_name
  }
}

# Create key pair
resource "aws_key_pair" "main" {
  key_name   = "${var.project_name}-keypair"
  public_key = var.ssh_public_key

  tags = {
    Name        = "${var.project_name}-keypair"
    Environment = "production"
    Project     = var.project_name
  }
}

# Create EC2 instance
resource "aws_instance" "web_app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.main.key_name
  subnet_id     = aws_subnet.public.id

  vpc_security_group_ids = [aws_security_group.web_app.id]

  # Root volume configuration
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    encrypted             = true
    delete_on_termination = true
  }

  # User data script to install and configure the application
  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    mysql_root_password  = var.mysql_root_password
    jwt_secret           = var.jwt_secret
    project_name         = var.project_name
    oauth2_client_id     = var.oauth2_client_id
    oauth2_client_secret = var.oauth2_client_secret
    oauth2_tenant_id     = var.oauth2_tenant_id
  }))

  tags = {
    Name        = "${var.project_name}-server"
    Environment = "production"
    Project     = var.project_name
  }
}

# Create Elastic IP
resource "aws_eip" "main" {
  instance = aws_instance.web_app.id
  vpc      = true

  tags = {
    Name        = "${var.project_name}-eip"
    Environment = "production"
    Project     = var.project_name
  }

  depends_on = [aws_internet_gateway.main]
}
