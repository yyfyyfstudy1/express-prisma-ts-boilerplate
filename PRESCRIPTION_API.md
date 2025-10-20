# Prescription API 文档

## 📋 概述

完整的处方 CRUD API，简洁清晰，不像原项目那样分散。

**基础URL**: `http://localhost:3344/api/client/prescription`

**认证**: 所有接口都需要 JWT Token 认证

---

## 🔐 认证

在请求头中添加：
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📚 API 端点

### 1️⃣ 获取所有处方

**请求**
```http
GET /api/client/prescription
GET /api/client/prescription?patientId=xxx
GET /api/client/prescription?docterId=xxx
```

**响应示例**
```json
{
  "success": true,
  "message": "Success",
  "content": [
    {
      "Id": "uuid-1",
      "patientId": "patient-uuid",
      "docterId": "doctor-uuid",
      "content": "处方内容",
      "creat_time": "2025-10-19T00:00:00.000Z",
      "update_time": "2025-10-19T00:00:00.000Z"
    }
  ]
}
```

**测试命令**
```bash
# 获取所有处方
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3344/api/client/prescription

# 按患者ID筛选
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3344/api/client/prescription?patientId=xxx"

# 按医生ID筛选
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3344/api/client/prescription?docterId=xxx"
```

---

### 2️⃣ 获取单个处方

**请求**
```http
GET /api/client/prescription/:id
```

**响应示例**
```json
{
  "success": true,
  "message": "Success",
  "content": {
    "Id": "uuid-1",
    "patientId": "patient-uuid",
    "docterId": "doctor-uuid",
    "content": "处方内容",
    "creat_time": "2025-10-19T00:00:00.000Z",
    "update_time": "2025-10-19T00:00:00.000Z"
  }
}
```

**测试命令**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3344/api/client/prescription/PRESCRIPTION_ID
```

---

### 3️⃣ 创建处方

**请求**
```http
POST /api/client/prescription
Content-Type: application/json
```

**请求体**
```json
{
  "patientId": "patient-uuid",
  "docterId": "doctor-uuid",
  "content": "阿莫西林 500mg，一日三次，饭后服用"
}
```

**响应示例**
```json
{
  "success": true,
  "message": "Created",
  "content": {
    "Id": "new-uuid",
    "patientId": "patient-uuid",
    "docterId": "doctor-uuid",
    "content": "阿莫西林 500mg，一日三次，饭后服用",
    "creat_time": "2025-10-19T01:00:00.000Z",
    "update_time": "2025-10-19T01:00:00.000Z"
  }
}
```

**测试命令**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-uuid",
    "docterId": "doctor-uuid",
    "content": "阿莫西林 500mg，一日三次，饭后服用"
  }' \
  http://localhost:3344/api/client/prescription
```

---

### 4️⃣ 更新处方

**请求**
```http
PUT /api/client/prescription/:id
Content-Type: application/json
```

**请求体**（所有字段都是可选的）
```json
{
  "content": "更新后的处方内容",
  "patientId": "new-patient-uuid",
  "docterId": "new-doctor-uuid"
}
```

**响应示例**
```json
{
  "success": true,
  "message": "Success",
  "content": {
    "Id": "uuid-1",
    "patientId": "patient-uuid",
    "docterId": "doctor-uuid",
    "content": "更新后的处方内容",
    "creat_time": "2025-10-19T00:00:00.000Z",
    "update_time": "2025-10-19T02:00:00.000Z"
  }
}
```

**测试命令**
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "更新后的处方内容"
  }' \
  http://localhost:3344/api/client/prescription/PRESCRIPTION_ID
```

---

### 5️⃣ 删除处方

**请求**
```http
DELETE /api/client/prescription/:id
```

**响应示例**
```json
{
  "success": true,
  "message": "Success",
  "content": {
    "message": "Prescription deleted successfully"
  }
}
```

**测试命令**
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3344/api/client/prescription/PRESCRIPTION_ID
```

---

## 🎯 代码架构

### 文件结构
```
src/
├── dao/prescription/
│   └── prescription_dao.ts          # 数据访问层（5个方法）
├── services/client/prescription/
│   └── prescription_service.ts      # 业务逻辑层（5个方法）
├── controllers/client/
│   └── prescription_controller.ts   # 控制器层（5个方法）
└── routes/client/v1/
    └── prescription_route.ts        # 路由定义（5个端点）
```

### 调用链
```
HTTP Request
    ↓
Route (prescription_route.ts)
    ↓
Auth Middleware (JWT验证)
    ↓
Controller (prescription_controller.ts)
    ↓
Service (prescription_service.ts)
    ↓
DAO (prescription_dao.ts)
    ↓
Prisma Client
    ↓
PostgreSQL Database
```

---

## ✅ 与原项目对比

### 原项目风格（太碎）
```
src/
├── dao/users/
│   ├── user_get_all_dao.ts      # 单独一个文件
│   ├── user_get_one_dao.ts      # 单独一个文件
│   ├── user_create_dao.ts       # 单独一个文件
│   ├── user_update_dao.ts       # 单独一个文件
│   └── user_delete_dao.ts       # 单独一个文件
└── services/client/user_auth/
    ├── login_service.ts         # 单独一个文件
    ├── logout_service.ts        # 单独一个文件
    ├── register_service.ts      # 单独一个文件
    └── ...                      # 更多单独文件
```

### 新的简洁风格
```
src/
├── dao/prescription/
│   └── prescription_dao.ts          # 一个文件，5个方法
├── services/client/prescription/
│   └── prescription_service.ts      # 一个文件，5个方法
├── controllers/client/
│   └── prescription_controller.ts   # 一个文件，5个方法
└── routes/client/v1/
    └── prescription_route.ts        # 一个文件，5个路由
```

**优点：**
- ✅ 代码更集中，易于维护
- ✅ 减少文件数量，结构清晰
- ✅ 方法都在同一个文件，便于查看和修改
- ✅ 符合单一职责原则（一个资源一组文件）

---

## 🧪 快速测试

### 1. 获取 JWT Token

首先登录获取 token：
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }' \
  http://localhost:3344/api/client/auth/login
```

### 2. 使用 Token 测试 API

```bash
# 设置 Token 变量
TOKEN="your_jwt_token_here"

# 创建处方
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-1",
    "docterId": "doctor-1",
    "content": "布洛芬 400mg，每日两次"
  }' \
  http://localhost:3344/api/client/prescription

# 获取所有处方
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3344/api/client/prescription
```

---

## 🎉 总结

✅ **完整的 CRUD 功能**
✅ **代码简洁集中**
✅ **结构清晰易懂**
✅ **包含 JWT 认证**
✅ **支持查询筛选**
✅ **包含 SQL 日志**（我们之前添加的）

比原项目的碎片化代码好多了！🚀

