# ============================================
# Outputs - 部署后的重要信息
# ============================================

# API Gateway URL (您的测试地址)
output "api_gateway_url" {
  description = "API Gateway 调用 URL（直接用这个测试）"
  value       = "${aws_apigatewayv2_api.main.api_endpoint}/prod"
}

# ALB DNS (内部地址)
output "alb_dns_name" {
  description = "ALB DNS 名称"
  value       = aws_lb.main.dns_name
}

# RDS Endpoint
output "rds_endpoint" {
  description = "RDS 数据库端点"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

# ECS Cluster Name
output "ecs_cluster_name" {
  description = "ECS Cluster 名称"
  value       = aws_ecs_cluster.main.name
}

# ECS Service Name
output "ecs_service_name" {
  description = "ECS Service 名称"
  value       = aws_ecs_service.api.name
}

# 完整的测试命令
output "test_commands" {
  description = "测试 API 的命令"
  value = <<EOT

# =============================================
# 测试命令
# =============================================

# 1. 测试基础接口
curl ${aws_apigatewayv2_api.main.api_endpoint}/prod/api/info

# 2. 用户注册
curl -X POST ${aws_apigatewayv2_api.main.api_endpoint}/prod/api/client/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"测试用户","phone":"13800138000","password":"test1234"}'

# 3. 用户登录
curl -X POST ${aws_apigatewayv2_api.main.api_endpoint}/prod/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'

# 4. 获取处方（需要先登录获取 token）
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  ${aws_apigatewayv2_api.main.api_endpoint}/prod/api/client/prescription

EOT
}

