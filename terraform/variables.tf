# ============================================
# 基础配置
# ============================================
variable "aws_region" {
  description = "AWS 区域"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI Profile"
  type        = string
  default     = "prod-account"
}

variable "project_name" {
  description = "项目名称"
  type        = string
  default     = "express-api"
}

variable "environment" {
  description = "环境名称"
  type        = string
  default     = "prod"
}

# ============================================
# 网络配置
# ============================================
variable "vpc_cidr" {
  description = "VPC CIDR 块"
  type        = string
  default     = "10.0.0.0/16"
}

# ============================================
# ECS 配置
# ============================================
variable "ecs_task_cpu" {
  description = "ECS Task CPU (256, 512, 1024, 2048, 4096)"
  type        = string
  default     = "512"
}

variable "ecs_task_memory" {
  description = "ECS Task Memory (512, 1024, 2048, 4096, 8192)"
  type        = string
  default     = "1024"
}

variable "ecs_desired_count" {
  description = "ECS 任务期望数量"
  type        = number
  default     = 2
}

# ============================================
# 数据库配置
# ============================================
variable "db_instance_class" {
  description = "RDS 实例类型"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "数据库名称"
  type        = string
  default     = "mydb"
}

variable "db_username" {
  description = "数据库用户名"
  type        = string
  default     = "resume"
  sensitive   = true
}

variable "db_password" {
  description = "数据库密码"
  type        = string
  sensitive   = true
}

# ============================================
# 应用配置
# ============================================
variable "jwt_secret_user" {
  description = "JWT 密钥"
  type        = string
  default     = "your-secret-key-change-in-production"
  sensitive   = true
}


variable "docker_image" {
  description = "Docker 镜像地址 (例如: yyfyyfstudy1/express-prisma-api:latest)"
  type        = string
  default     = "yyfyyfstudy1/express-prisma-api:latest"
}
