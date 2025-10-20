#!/bin/bash

# ============================================
# AWS ECS 部署脚本
# ============================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Express API AWS ECS 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ============================================
# 1. 设置 AWS Profile
# ============================================
export AWS_PROFILE=prod-account

echo -e "${YELLOW}[1/6]${NC} 验证 AWS 凭证..."
aws sts get-caller-identity || {
    echo -e "${RED}❌ AWS 凭证验证失败${NC}"
    exit 1
}
echo -e "${GREEN}✅ AWS 凭证验证成功${NC}"
echo ""

# ============================================
# 2. 获取 AWS 账号信息
# ============================================
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
ECR_REPO_NAME="express-prisma-api"
IMAGE_TAG="latest"

echo -e "${YELLOW}[2/6]${NC} AWS 账号信息:"
echo "  Account ID: $ACCOUNT_ID"
echo "  Region: $REGION"
echo ""

# ============================================
# 3. 构建 Docker 镜像
# ============================================
echo -e "${YELLOW}[3/6]${NC} 构建 Docker 镜像..."
docker build -t ${ECR_REPO_NAME}:${IMAGE_TAG} . || {
    echo -e "${RED}❌ Docker 构建失败${NC}"
    exit 1
}
echo -e "${GREEN}✅ Docker 镜像构建成功${NC}"
echo ""

# ============================================
# 4. 推送镜像到 ECR
# ============================================
echo -e "${YELLOW}[4/6]${NC} 推送镜像到 ECR..."

# ECR 登录
aws ecr get-login-password --region ${REGION} | \
  docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com || {
    echo -e "${RED}❌ ECR 登录失败${NC}"
    exit 1
}

# 检查 ECR 仓库是否存在，不存在则创建
aws ecr describe-repositories --repository-names ${ECR_REPO_NAME} --region ${REGION} >/dev/null 2>&1 || {
    echo "  创建 ECR 仓库..."
    aws ecr create-repository --repository-name ${ECR_REPO_NAME} --region ${REGION}
}

# Tag 镜像
docker tag ${ECR_REPO_NAME}:${IMAGE_TAG} \
  ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}

# 推送镜像
docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG} || {
    echo -e "${RED}❌ 镜像推送失败${NC}"
    exit 1
}

echo -e "${GREEN}✅ 镜像推送成功${NC}"
echo "  镜像地址: ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}"
echo ""

# ============================================
# 5. 部署基础设施 (Terraform)
# ============================================
echo -e "${YELLOW}[5/6]${NC} 部署基础设施..."

cd terraform

# 初始化 Terraform（如果需要）
if [ ! -d ".terraform" ]; then
    echo "  初始化 Terraform..."
    terraform init
fi

# 应用 Terraform
echo "  应用 Terraform 配置..."
terraform apply -auto-approve || {
    echo -e "${RED}❌ Terraform 部署失败${NC}"
    exit 1
}

echo -e "${GREEN}✅ 基础设施部署成功${NC}"
echo ""

# ============================================
# 6. 更新 ECS Service (强制新部署)
# ============================================
echo -e "${YELLOW}[6/6]${NC} 更新 ECS Service..."

CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
SERVICE_NAME=$(terraform output -raw ecs_service_name)

aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --force-new-deployment \
  --region ${REGION} >/dev/null 2>&1 || {
    echo -e "${RED}❌ ECS Service 更新失败${NC}"
    exit 1
}

echo -e "${GREEN}✅ ECS Service 更新成功${NC}"
echo ""

# ============================================
# 部署完成
# ============================================
API_URL=$(terraform output -raw api_gateway_url)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🎉 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📝 重要信息：${NC}"
echo ""
echo -e "${GREEN}API Gateway URL（测试地址）:${NC}"
echo "  $API_URL"
echo ""
echo -e "${GREEN}测试命令：${NC}"
echo ""
echo "# 1. 测试健康检查"
echo "curl $API_URL/api/info"
echo ""
echo "# 2. 查看 Swagger 文档"
echo "# (注意：生产环境可能禁用了 /api/docs)"
echo ""
echo "# 3. 用户注册"
echo "curl -X POST $API_URL/api/client/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\",\"name\":\"测试\",\"phone\":\"13800138000\",\"password\":\"test1234\"}'"
echo ""
echo "# 4. 用户登录"
echo "curl -X POST $API_URL/api/client/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\",\"password\":\"test1234\"}'"
echo ""
echo -e "${YELLOW}📊 监控：${NC}"
echo "CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#logsV2:log-groups/log-group/%2Fecs%2Fexpress-api"
echo ""
echo -e "${GREEN}========================================${NC}"

