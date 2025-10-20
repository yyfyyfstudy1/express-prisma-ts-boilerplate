# AWS ECS 部署架构（精简版）

## 🏗️ 核心架构图

```
                        Internet (用户访问)
                               │
                               │
                    ┌──────────▼──────────┐
                    │   API Gateway       │  ← 您的测试入口
                    │   REST API          │     https://xxx.execute-api.us-east-1.amazonaws.com/prod
                    │   - 限流            │
                    │   - 认证            │
                    └──────────┬──────────┘
                               │
                               │
    ┌──────────────────────────▼────────────────────────────┐
    │                    AWS VPC (10.0.0.0/16)               │
    │                                                        │
    │  ┌─────────────────────────────────────────────┐     │
    │  │   Application Load Balancer (ALB)           │     │
    │  │   - Health Check: /api/info                 │     │
    │  │   - Port: 80 → 3344                         │     │
    │  └──────────────┬──────────────────────────────┘     │
    │                 │                                     │
    │    ┌────────────▼────────────┐                       │
    │    │   Public Subnet         │                       │
    │    │   10.0.1.0/24           │                       │
    │    └─────────────────────────┘                       │
    │                                                        │
    │  ┌──────────────────────────────────────────────┐    │
    │  │         ECS Cluster (Fargate)                │    │
    │  │                                              │    │
    │  │  ┌────────────────┐  ┌────────────────┐    │    │
    │  │  │  ECS Task 1    │  │  ECS Task 2    │    │    │
    │  │  │  ┌──────────┐  │  │  ┌──────────┐  │    │    │
    │  │  │  │Express API│  │  │  │Express API│  │    │    │
    │  │  │  │Port: 3344 │  │  │  │Port: 3344 │  │    │    │
    │  │  │  └──────────┘  │  │  └──────────┘  │    │    │
    │  │  │  Private Subnet│  │  Private Subnet│    │    │
    │  │  └────────────────┘  └────────────────┘    │    │
    │  └──────────────────────────────────────────────┘    │
    │                        │                             │
    │                        │                             │
    │              ┌─────────▼─────────┐                   │
    │              │  RDS PostgreSQL   │                   │
    │              │  Port: 5432       │                   │
    │              │  Private Subnet   │                   │
    │              └───────────────────┘                   │
    │                                                        │
    └────────────────────────────────────────────────────────┘

支持服务:
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│ ECR (镜像)  │  │ CloudWatch   │  │ Secrets Mgr │
│ 存储 Docker │  │ 日志和监控    │  │ 数据库密码   │
└─────────────┘  └──────────────┘  └─────────────┘
```

---

## 📊 组件说明

### 1️⃣ **API Gateway**
```
类型: REST API
用途: 
  - 统一入口，您直接用这个URL测试
  - 内置限流保护
  - 可选的 API Key 认证
  
集成方式: HTTP Proxy
  - 转发所有请求到 ALB
  
测试 URL: 
  https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/info
```

---

### 2️⃣ **ALB (应用负载均衡器)**
```
用途:
  - 负载均衡（分发请求到多个 ECS 任务）
  - 健康检查（自动剔除不健康的容器）
  
监听:
  - Port 80 (HTTP)
  
目标组:
  - ECS Tasks (Port 3344)
  
健康检查:
  - Path: /api/info
  - Interval: 30s
  - Timeout: 5s
```

---

### 3️⃣ **VPC (虚拟私有云)**
```
CIDR: 10.0.0.0/16

子网配置:
  ┌─────────────────────────────────────────┐
  │ Public Subnet (10.0.1.0/24)             │
  │ - ALB                                   │
  │ - NAT Gateway                           │
  └─────────────────────────────────────────┘
  
  ┌─────────────────────────────────────────┐
  │ Private Subnet - App (10.0.10.0/24)     │
  │ - ECS Tasks                             │
  └─────────────────────────────────────────┘
  
  ┌─────────────────────────────────────────┐
  │ Private Subnet - DB (10.0.20.0/24)      │
  │ - RDS PostgreSQL                        │
  └─────────────────────────────────────────┘

安全组:
  - ALB SG:  允许 80 from 0.0.0.0/0
  - ECS SG:  允许 3344 from ALB SG
  - RDS SG:  允许 5432 from ECS SG
```

---

### 4️⃣ **ECS (容器服务)**
```
Cluster: api-cluster
Service: api-service
  - Launch Type: Fargate (无需管理服务器)
  - Desired Count: 2
  - CPU: 512 (0.5 vCPU)
  - Memory: 1024 MB
  - 镜像: {account}.dkr.ecr.us-east-1.amazonaws.com/api:latest
  
容器配置:
  - Port: 3344
  - 环境变量: 从 Secrets Manager 注入
  - 日志: CloudWatch Logs
```

---

## 🚀 请求流程

```
用户
  ↓
https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/info
  ↓
API Gateway (限流、认证)
  ↓
ALB (负载均衡)
  ↓
ECS Task 1 或 Task 2 (Express API)
  ↓
RDS PostgreSQL
  ↓
返回响应
```

---

## 📁 Terraform 文件结构（精简版）

```
terraform/
├── main.tf                    # 主配置文件
│   ├─ VPC 资源
│   ├─ ALB 资源
│   ├─ ECS 资源
│   ├─ API Gateway 资源
│   └─ RDS 资源
│
├── variables.tf               # 变量定义
├── outputs.tf                 # 输出（API Gateway URL等）
├── terraform.tfvars           # 变量值
└── backend.tf                 # State 存储配置
```

---

## 💰 成本估算（精简版）

```
ECS Fargate (2 tasks):        ~$30/月
RDS db.t3.micro:              ~$15/月
ALB:                          ~$20/月
NAT Gateway:                  ~$45/月
API Gateway:                  ~$3.5/月 (每百万请求)
────────────────────────────────────
总计:                         ~$113/月
```

---

## 🎯 部署后的访问方式

### **API Gateway URL（您的测试地址）:**
```bash
# 基础 URL
https://abc123.execute-api.us-east-1.amazonaws.com/prod

# 测试接口
curl https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/info

# 登录
curl -X POST \
  https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 获取处方
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/client/prescription
```

---

## 📝 部署步骤（简化）

### **1. 构建并推送 Docker 镜像**
```bash
# 构建镜像
docker build -t api:latest .

# 推送到 ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {account}.dkr.ecr.us-east-1.amazonaws.com
docker tag api:latest {account}.dkr.ecr.us-east-1.amazonaws.com/api:latest
docker push {account}.dkr.ecr.us-east-1.amazonaws.com/api:latest
```

### **2. 运行 Terraform**
```bash
cd terraform/
terraform init
terraform plan
terraform apply -auto-approve
```

### **3. 获取 API Gateway URL**
```bash
terraform output api_gateway_url
```

### **4. 测试**
```bash
curl $(terraform output -raw api_gateway_url)/api/info
```

---

## 🎯 下一步

我现在为您创建：
1. ✅ **Dockerfile** (多阶段构建)
2. ✅ **Terraform 代码** (精简版，只包含4个核心组件)
3. ✅ **部署脚本** (一键部署)

开始创建？🚀
