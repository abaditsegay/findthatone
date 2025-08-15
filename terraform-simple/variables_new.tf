variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "findthatone"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
  default     = ""
}

variable "mysql_root_password" {
  description = "MySQL root password"
  type        = string
  sensitive   = true
  default     = "FindTheOne2024!"
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
  default     = "mySecretKey12345678901234567890"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
  default     = "FindTheOne2024!SecureDB"
}

variable "mail_password" {
  description = "Email password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "backend_image_tag" {
  description = "Backend Docker image tag"
  type        = string
  default     = ""
}

variable "frontend_image_tag" {
  description = "Frontend Docker image tag"
  type        = string
  default     = ""
}

variable "ssl_certificate_arn" {
  description = "SSL certificate ARN"
  type        = string
  default     = ""
}

variable "oauth2_client_id" {
  description = "OAuth2 client ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "oauth2_client_secret" {
  description = "OAuth2 client secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "oauth2_tenant_id" {
  description = "OAuth2 tenant ID"
  type        = string
  sensitive   = true
  default     = ""
}
