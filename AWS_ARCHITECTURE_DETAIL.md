# AWS 部署架构详细文档

## 📊 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                     Internet                                         │
└────────────────────────────────────┬────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │   API Gateway (HTTPS) │       │   直接访问 ALB (HTTP) │
        │  v3ohmxbmpj           │       │                       │
        └───────────┬───────────┘       └───────────┬───────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        VPC: 10.0.0.0/16 (ap-southeast-2)                            │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐ │
│  │                          Internet Gateway (igw)                               │ │
│  └────────────────────────────────┬──────────────────────────────────────────────┘ │
│                                   │                                                 │
│  ┌────────────────────────────────┴──────────────────────────────────────────────┐ │
│  │                         Public Route Table                                    │ │
│  │  - 10.0.0.0/16 → local                                                        │ │
│  │  - 0.0.0.0/0 → Internet Gateway                                               │ │
│  └────────────────────────────────┬──────────────────────────────────────────────┘ │
│                                   │                                                 │
│  ┌────────────────────────────────┴──────────────────────────────────────────────┐ │
│  │                     Availability Zone: ap-southeast-2a                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Public Subnet 1: 10.0.1.0/24                                           │  │ │
│  │  │  ┌───────────────────────────────────────────────────────┐              │  │ │
│  │  │  │  Application Load Balancer (ALB)                      │              │  │ │
│  │  │  │  - express-api-alb                                    │              │  │ │
│  │  │  │  - Internet-facing                                    │              │  │ │
│  │  │  │  - Security Group: sg-0ca958a9f3b487883              │              │  │ │
│  │  │  │    • Inbound: 0.0.0.0/0:80 (HTTP from Internet)      │              │  │ │
│  │  │  │    • Inbound: sg-046ea384b4129ef66:80 (VPC Link)     │              │  │ │
│  │  │  │    • Outbound: 0.0.0.0/0 (All)                        │              │  │ │
│  │  │  └───────────────────┬───────────────────────────────────┘              │  │ │
│  │  │                      │ Target Group: express-api-tg                     │  │ │
│  │  │                      │ Health Check: /api/info (HTTP:3344)              │  │ │
│  │  │  ┌───────────────────┴───────────────────────────────────┐              │  │ │
│  │  │  │  NAT Gateway (nat-gateway)                            │              │  │ │
│  │  │  │  - Elastic IP: xxx.xxx.xxx.xxx                        │              │  │ │
│  │  │  │  - 为私有子网提供互联网访问                            │              │  │ │
│  │  │  └───────────────────────────────────────────────────────┘              │  │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Private App Subnet: 10.0.10.0/24                                       │  │ │
│  │  │  - Route: 0.0.0.0/0 → NAT Gateway (通过公有子网)                        │  │ │
│  │  │  ┌───────────────────────────────────────────────────────┐              │  │ │
│  │  │  │  ECS Tasks (Fargate) - 2 个任务                        │              │  │ │
│  │  │  │  - Task: express-api-task                             │              │  │ │
│  │  │  │  - Container: api (yyfyyfstudy1/express-prisma-api)   │              │  │ │
│  │  │  │  - Security Group: sg-0578203a7c88cc9e7               │              │  │ │
│  │  │  │    • Inbound: sg-0ca958a9f3b487883:3344 (from ALB)    │              │  │ │
│  │  │  │    • Outbound: 0.0.0.0/0 (All)                        │              │  │ │
│  │  │  │  - CPU: 512 (0.5 vCPU)                                │              │  │ │
│  │  │  │  - Memory: 1024 MB                                     │              │  │ │
│  │  │  │  - Public IP: **Disabled** (私有IP)                   │              │  │ │
│  │  │  │  - 通过 NAT Gateway 访问 Docker Hub                    │              │  │ │
│  │  │  └───────────────────────────────────────────────────────┘              │  │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                     Availability Zone: ap-southeast-2b                          │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │ │
│  │  │  Public Subnet 2: 10.0.2.0/24                                           │    │ │
│  │  │  ┌───────────────────────────────────────────────────────┐              │    │ │
│  │  │  │  Application Load Balancer (ALB) - 第二个AZ            │              │    │ │
│  │  │  └───────────────────────────────────────────────────────┘              │    │ │
│  │  └─────────────────────────────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │                 Private App Subnet: 10.0.10.0/24 (AZ-a)                         │ │
│  │  - Route: 0.0.0.0/0 → NAT Gateway                                              │ │
│  │  - Route: 10.0.0.0/16 → local                                                  │ │
│  │                                                                                 │ │
│  │  ┌───────────────────────────────────────────────────────┐                     │ │
│  │  │  VPC Endpoints                                        │                     │ │
│  │  │  - S3 Gateway Endpoint                                │                     │ │
│  │  │  - CloudWatch Logs Interface Endpoint                 │                     │ │
│  │  └───────────────────────────────────────────────────────┘                     │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │              Private DB Subnet 1: 10.0.20.0/24 (AZ-a)                           │ │
│  │  ┌───────────────────────────────────────────────────────┐                     │ │
│  │  │  RDS PostgreSQL 14.13                                 │                     │ │
│  │  │  - Instance: express-api-db                           │                     │ │
│  │  │  - Database: mydb                                      │                     │ │
│  │  │  - Security Group: sg-0bdd4ab646e5c63f5                │                     │ │
│  │  │    • Inbound: sg-0578203a7c88cc9e7:5432 (from ECS)    │                     │ │
│  │  │    • Outbound: None (默认)                             │                     │ │
│  │  └───────────────────────────────────────────────────────┘                     │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│  │              Private DB Subnet 2: 10.0.21.0/24 (AZ-b)                           │ │
│  │  - RDS Multi-AZ Standby (如果启用)                                              │ │
│  └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 安全组详细规则

### 1️⃣ ALB 安全组 (sg-0ca958a9f3b487883)

**名称：** `express-api-alb-sg`

**入站规则 (Inbound)：**
| 协议 | 端口 | 来源 | 描述 |
|------|------|------|------|
| TCP | 80 | 0.0.0.0/0 | 允许互联网 HTTP 访问 |
| TCP | 80 | sg-046ea384b4129ef66 | 允许 VPC Link 访问（保留但不使用）|

**出站规则 (Outbound)：**
| 协议 | 端口 | 目标 | 描述 |
|------|------|------|------|
| All | All | 0.0.0.0/0 | 允许所有出站流量 |

---

### 2️⃣ ECS 安全组 (sg-0578203a7c88cc9e7)

**名称：** `express-api-ecs-sg`

**入站规则 (Inbound)：**
| 协议 | 端口 | 来源 | 描述 |
|------|------|------|------|
| TCP | 3344 | sg-0ca958a9f3b487883 | 只允许来自 ALB 的流量 |

**出站规则 (Outbound)：**
| 协议 | 端口 | 目标 | 描述 |
|------|------|------|------|
| All | All | 0.0.0.0/0 | 允许所有出站（访问 Docker Hub、RDS等）|

---

### 3️⃣ RDS 安全组 (sg-0bdd4ab646e5c63f5)

**名称：** `express-api-rds-sg`

**入站规则 (Inbound)：**
| 协议 | 端口 | 来源 | 描述 |
|------|------|------|------|
| TCP | 5432 | sg-0578203a7c88cc9e7 | 只允许来自 ECS 的 PostgreSQL 连接 |

**出站规则 (Outbound)：**
| 协议 | 端口 | 目标 | 描述 |
|------|------|------|------|
| 无 | - | - | 默认无出站规则 |

---

### 4️⃣ VPC Link 安全组 (sg-046ea384b4129ef66)

**名称：** `express-api-vpc-link-sg`

**入站规则 (Inbound)：**
| 协议 | 端口 | 来源 | 描述 |
|------|------|------|------|
| 无 | - | - | 无入站规则 |

**出站规则 (Outbound)：**
| 协议 | 端口 | 目标 | 描述 |
|------|------|------|------|
| All | All | 0.0.0.0/0 | 允许所有出站 |

**注意：** VPC Link 目前保留但不使用（因为 ALB 是公网可访问）

---

## 🌐 网络拓扑详情

### VPC 配置
- **VPC ID:** vpc-0e70fb75996079960
- **CIDR:** 10.0.0.0/16
- **Region:** ap-southeast-2 (悉尼)
- **DNS Hostnames:** ✅ Enabled
- **DNS Support:** ✅ Enabled

### 可用区 (Availability Zones)

#### AZ-a (ap-southeast-2a)
| 子网类型 | 子网 ID | CIDR | 用途 |
|---------|---------|------|------|
| Public | subnet-0cd7eeb88687d6713 | 10.0.1.0/24 | ALB, ECS Tasks, NAT Gateway |
| Private App | subnet-015c3e46c442fef70 | 10.0.10.0/24 | VPC Endpoints |
| Private DB | subnet-08366649f02d92274 | 10.0.20.0/24 | RDS Primary |

#### AZ-b (ap-southeast-2b)
| 子网类型 | 子网 ID | CIDR | 用途 |
|---------|---------|------|------|
| Public | subnet-08a6fad2107029d00 | 10.0.2.0/24 | ALB, ECS Tasks |
| Private DB | subnet-04b76bcd8f8327610 | 10.0.21.0/24 | RDS Standby |

---

## 🔄 流量路径

### 路径 1: 通过 API Gateway 访问

```
Internet 用户
    ↓ HTTPS (443)
API Gateway (v3ohmxbmpj.execute-api.ap-southeast-2.amazonaws.com)
    ↓ HTTP (80) - 直接 HTTP Integration
Application Load Balancer (express-api-alb-1245843199.ap-southeast-2.elb.amazonaws.com)
    ↓ HTTP (3344) - Target Group
ECS Fargate Tasks (2个) - 10.0.1.x, 10.0.2.x
    ↓ PostgreSQL (5432)
RDS PostgreSQL (express-api-db.c0jnla4aqodu.ap-southeast-2.rds.amazonaws.com)
```

### 路径 2: 直接通过 ALB 访问

```
Internet 用户
    ↓ HTTP (80)
Application Load Balancer
    ↓ HTTP (3344)
ECS Fargate Tasks
    ↓ PostgreSQL (5432)
RDS PostgreSQL
```

---

## 📦 组件详情

### API Gateway
- **类型:** HTTP API
- **ID:** v3ohmxbmpj
- **URL:** https://v3ohmxbmpj.execute-api.ap-southeast-2.amazonaws.com
- **Stage:** prod
- **Integration:** HTTP_PROXY (直接到 ALB，无 VPC Link)
- **Route:** ANY /{proxy+}

### Application Load Balancer
- **名称:** express-api-alb
- **DNS:** express-api-alb-1245843199.ap-southeast-2.elb.amazonaws.com
- **类型:** Internet-facing
- **Scheme:** Application Load Balancer
- **子网:** Public Subnet 1 + 2 (跨 AZ)
- **Listener:** HTTP:80 → Target Group

### ECS Fargate
- **Cluster:** express-api-cluster
- **Service:** express-api-service
- **Task Definition:** express-api-task (最新版本)
- **Desired Count:** 2
- **Launch Type:** FARGATE
- **平台版本:** LATEST
- **容器配置:**
  - 镜像: yyfyyfstudy1/express-prisma-api:latest
  - CPU: 512 (0.5 vCPU)
  - Memory: 1024 MB
  - 端口: 3344
  - 健康检查: Node.js HTTP 检查 `/api/info`
- **网络配置:**
  - 子网: **Private App Subnet** (10.0.10.0/24)
  - Public IP: **Disabled** (通过 NAT Gateway 访问互联网)
  - 安全组: express-api-ecs-sg

### RDS PostgreSQL
- **标识符:** express-api-db
- **引擎:** PostgreSQL 14.13
- **实例类型:** db.t3.micro
- **存储:** 20 GB gp3 (可扩展到 100 GB)
- **数据库名:** mydb
- **Multi-AZ:** Single-AZ (可升级为 Multi-AZ)
- **子网组:** express-api-db-subnet-group
  - Private DB Subnet 1 (AZ-a)
  - Private DB Subnet 2 (AZ-b)
- **备份:**
  - 保留期: 7 天
  - 备份窗口: 03:00-04:00
  - 维护窗口: Sun 04:00-05:00

---

## 🔐 IAM 角色

### ECS Task Execution Role
- **名称:** express-api-ecs-task-execution-role
- **用途:** 拉取 Docker 镜像，写入 CloudWatch 日志
- **策略:** AmazonECSTaskExecutionRolePolicy

### ECS Task Role
- **名称:** express-api-ecs-task-role
- **用途:** 应用运行时的权限（如访问 S3、其他 AWS 服务）
- **策略:** 自定义（当前最小权限）

---

## 📊 路由表配置

### Public Route Table
- **关联子网:** Public Subnet 1, Public Subnet 2
- **路由规则:**
  - 10.0.0.0/16 → local
  - 0.0.0.0/0 → Internet Gateway

### Private App Route Table
- **关联子网:** Private App Subnet
- **路由规则:**
  - 10.0.0.0/16 → local
  - 0.0.0.0/0 → NAT Gateway

### Private DB Route Table
- **关联子网:** Private DB Subnet 1, Private DB Subnet 2
- **路由规则:**
  - 10.0.0.0/16 → local
  - 无互联网访问

---

## 🎯 安全层级

```
┌─────────────────────────────────────────────────┐
│ Layer 1: Internet (Public)                     │
│  - API Gateway: HTTPS 加密                      │
│  - ALB: HTTP (可升级为 HTTPS with ACM)          │
│  - 位于: Public Subnet                          │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ Layer 2: Application (Private Subnet) ✅        │
│  - ECS Tasks: 只接受 ALB 流量                   │
│  - 无公网 IP，通过 NAT Gateway 访问互联网       │
│  - Security Group 严格控制                      │
│  - 位于: Private App Subnet                     │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│ Layer 3: Database (Private Subnet) ✅           │
│  - RDS: 完全隔离，只接受 ECS 流量               │
│  - 无公网 IP                                    │
│  - 无互联网访问                                  │
│  - 位于: Private DB Subnet                      │
└─────────────────────────────────────────────────┘
```

---

## 📈 数据流图

```
┌─────────┐
│  用户   │
└────┬────┘
     │
     ├─────────────────────────────────────┐
     │                                     │
     ▼                                     ▼
┌─────────────┐                    ┌──────────┐
│ API Gateway │                    │   ALB    │
│   (HTTPS)   │──── HTTP ─────────→│  (HTTP)  │
└─────────────┘                    └─────┬────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Target Group │
                                  │ Health Check │
                                  └──────┬───────┘
                                         │
                              ┌──────────┴──────────┐
                              ▼                     ▼
                        ┌──────────┐          ┌──────────┐
                        │ ECS Task │          │ ECS Task │
                        │   (AZ-a) │          │   (AZ-b) │
                        │ 10.0.1.x │          │ 10.0.2.x │
                        └─────┬────┘          └─────┬────┘
                              │                     │
                              └──────────┬──────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │ RDS Primary │
                                  │ (Private)   │
                                  │ 10.0.20.x   │
                                  └─────────────┘
```

---

## 🔧 关键配置参数

### ECS 环境变量
```bash
NODE_ENV=production
APP_URL_HOST=express-api-alb-1245843199.ap-southeast-2.elb.amazonaws.com
APP_URL_PORT=3344
DATABASE_URL=postgresql://resume:***@express-api-db.c0jnla4aqodu.ap-southeast-2.rds.amazonaws.com:5432/mydb?sslmode=disable&schema=public
JWT_SECRET_USER=***
```

### Docker 镜像
- **仓库:** yyfyyfstudy1/express-prisma-api
- **标签:** latest
- **平台:** linux/amd64
- **基础镜像:** node:20-slim (Debian)
- **Prisma 引擎:** debian-openssl-3.0.x
- **大小:** ~600 MB

### 健康检查
- **ECS Container Health Check:**
  - 命令: `node -e "require('http').get('http://localhost:3344/api/info', ...)"`
  - 间隔: 30秒
  - 超时: 5秒
  - 重试: 3次
  - 启动期: 60秒

- **ALB Target Group Health Check:**
  - 路径: /api/info
  - 协议: HTTP
  - 端口: 3344
  - 健康阈值: 2
  - 不健康阈值: 3
  - 间隔: 30秒
  - 超时: 5秒

---

## 📝 部署说明

### 当前状态
- ✅ 所有组件已部署在悉尼（ap-southeast-2）
- ✅ ECS 2个任务健康运行
- ✅ RDS 数据库已连接并完成 migration
- ✅ API Gateway 和 ALB 都正常工作
- ✅ Prescription 表已创建

### 访问地址
- **API Gateway:** https://v3ohmxbmpj.execute-api.ap-southeast-2.amazonaws.com/prod
- **ALB:** http://express-api-alb-1245843199.ap-southeast-2.elb.amazonaws.com

---

## 🎯 架构优化建议

### 已实现
- ✅ Multi-AZ 高可用（ALB 跨两个 AZ）
- ✅ 容器健康检查
- ✅ RDS 自动备份
- ✅ CloudWatch 日志
- ✅ 最小权限原则（安全组严格控制）

### 可选优化
- 🔄 RDS Multi-AZ（提高数据库可用性）
- 🔄 ALB 启用 HTTPS（使用 ACM 证书）
- 🔄 ECS 自动扩缩容（基于 CPU/内存）
- 🔄 CloudFront CDN（全球加速）
- 🔄 WAF（Web 应用防火墙）

---

**创建时间:** 2025-10-20  
**区域:** ap-southeast-2 (悉尼)  
**状态:** ✅ 生产环境运行中

