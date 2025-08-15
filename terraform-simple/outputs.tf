# Outputs for FindThatOne deployment

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.web_app.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.main.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.web_app.public_dns
}

output "frontend_url" {
  description = "URL to access the frontend application"
  value       = "http://${aws_eip.main.public_ip}:3000"
}

output "backend_url" {
  description = "URL to access the backend API"
  value       = "http://${aws_eip.main.public_ip}:8091"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/${var.project_name}-keypair.pem ubuntu@${aws_eip.main.public_ip}"
}

output "application_info" {
  description = "Application access information"
  value = {
    frontend    = "http://${aws_eip.main.public_ip}:3000"
    backend     = "http://${aws_eip.main.public_ip}:8091"
    public_ip   = aws_eip.main.public_ip
    ssh_access  = "ssh -i ~/.ssh/${var.project_name}-keypair.pem ubuntu@${aws_eip.main.public_ip}"
  }
}
