# Swagger JSDoc 使用指南

## ✅ 改造完成！

已成功将 Swagger 文档生成方式从 **Postman Collection** 改为 **Swagger JSDoc**！

---

## 🎯 改造的好处

### ❌ 旧方式（Postman Collection）
- 需要手动编辑 JSON 文件
- 代码和文档分离
- 容易遗漏和出错
- 修改后需要重启服务器

### ✅ 新方式（Swagger JSDoc）
- **代码即文档** - 注释直接写在路由文件中
- **自动生成** - 修改注释立即生效
- **类型安全** - 使用 OpenAPI 标准
- **易于维护** - 和代码在一起

---

## 📚 如何为新 API 添加文档

### 示例：添加一个新的 GET 接口

```typescript
/**
 * @swagger
 * /client/prescription/{id}:
 *   get:
 *     summary: 获取单个处方
 *     description: 根据ID获取处方详情
 *     tags:
 *       - Prescription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 处方ID
 *     responses:
 *       200:
 *         description: 成功返回处方详情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 *       401:
 *         description: 未授权
 */
router.get('/:id', auth('jwt-user'), prescriptionController.getOne);
```

---

## 📖 JSDoc 注释结构说明

### 1️⃣ **基本信息**
```yaml
summary: 接口简短描述（一行）
description: 接口详细描述（可多行）
tags:
  - Prescription  # API 分组标签
```

### 2️⃣ **认证**
```yaml
security:
  - bearerAuth: []  # 需要 JWT 认证
```

### 3️⃣ **参数**

**路径参数（Path Parameters）：**
```yaml
parameters:
  - in: path
    name: id
    required: true
    schema:
      type: string
    description: 资源ID
```

**查询参数（Query Parameters）：**
```yaml
parameters:
  - in: query
    name: page
    schema:
      type: integer
      default: 1
    description: 页码
```

**请求体（Request Body）：**
```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/CreatePrescriptionRequest'
      example:
        field1: "value1"
        field2: "value2"
```

### 4️⃣ **响应**
```yaml
responses:
  200:
    description: 成功
    content:
      application/json:
        schema:
          type: object
          properties:
            success:
              type: boolean
            data:
              type: array
              items:
                $ref: '#/components/schemas/Prescription'
  401:
    description: 未授权
  404:
    description: 未找到
```

---

## 🔧 添加新的 Schema

如果需要定义新的数据结构，在 `swagger-jsdoc-config.ts` 中添加：

```typescript
components: {
  schemas: {
    // 新增一个 Schema
    Patient: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        name: {
          type: 'string',
          example: '张三',
        },
        age: {
          type: 'integer',
          example: 30,
        },
      },
    },
  },
}
```

然后在路由注释中引用：
```yaml
schema:
  $ref: '#/components/schemas/Patient'
```

---

## 🎨 常用的 HTTP 方法示例

### GET（查询）
```typescript
/**
 * @swagger
 * /api/resource:
 *   get:
 *     summary: 获取资源列表
 *     tags: [Resource]
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/', controller.getAll);
```

### POST（创建）
```typescript
/**
 * @swagger
 * /api/resource:
 *   post:
 *     summary: 创建资源
 *     tags: [Resource]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: 创建成功
 */
router.post('/', controller.create);
```

### PUT（更新）
```typescript
/**
 * @swagger
 * /api/resource/{id}:
 *   put:
 *     summary: 更新资源
 *     tags: [Resource]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/:id', controller.update);
```

### DELETE（删除）
```typescript
/**
 * @swagger
 * /api/resource/{id}:
 *   delete:
 *     summary: 删除资源
 *     tags: [Resource]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.delete('/:id', controller.remove);
```

---

## 🌐 查看文档

### **访问地址**
```
http://localhost:3344/api/docs
```

### **特点**
- ✅ 自动生成的交互式文档
- ✅ 可以直接在页面上测试 API
- ✅ 支持 JWT 认证（点击 "Authorize" 按钮）
- ✅ 代码修改后刷新页面即可看到更新

---

## 📁 文件结构

```
src/
├── utils/swagger/
│   ├── swagger-jsdoc-config.ts  ← Swagger 配置（schemas定义）
│   └── postman_to_swagger.ts    ← 旧的（可以删除）
├── routes/
│   ├── client/v1/
│   │   └── prescription_route.ts  ← JSDoc 注释在这里
│   └── commons/docs/
│       └── docs_route.ts  ← Swagger UI 路由（已更新）
```

---

## 🎯 快速添加新 API 步骤

1. **在路由文件中添加 JSDoc 注释**
   ```typescript
   /**
    * @swagger
    * /api/your-endpoint:
    *   get:
    *     summary: 你的 API 描述
    *     ...
    */
   router.get('/your-endpoint', controller.method);
   ```

2. **保存文件**

3. **刷新浏览器**
   - 访问 `http://localhost:3344/api/docs`
   - 立即看到新的 API 文档

4. **测试 API**
   - 点击接口展开
   - 点击 "Try it out"
   - 填写参数
   - 点击 "Execute"

---

## 🆚 对比：添加新 API 的流程

| 步骤 | 旧方式（Postman） | 新方式（JSDoc） |
|------|------------------|----------------|
| 1. 写代码 | 写路由代码 | 写路由代码 |
| 2. 写文档 | 打开 JSON 文件手动编辑 | 在代码上方添加注释 |
| 3. 格式 | JSON（容易出错） | YAML in JSDoc |
| 4. 验证 | 重启服务器才能看 | 刷新浏览器即可 |
| 5. 维护 | 代码和文档分离 | 代码即文档 |

---

## 💡 最佳实践

### ✅ 推荐
- 注释写在路由定义的正上方
- 使用清晰的中文描述
- 为所有参数添加 description
- 提供 example 示例值
- 使用 $ref 引用 schemas（避免重复）

### ⚠️ 注意
- 注释格式必须严格（YAML 缩进）
- 路径要和实际路由匹配
- 参数名要和代码一致

---

## 🎉 总结

**现在添加新 API 文档只需要：**

1. 在路由文件添加 JSDoc 注释
2. 保存
3. 刷新浏览器

**就这么简单！** 🚀

**不再需要：**
- ❌ 编辑 Postman Collection JSON
- ❌ 运行 Python 脚本
- ❌ 重启服务器
- ❌ 维护分离的文档文件

**代码即文档！优雅多了！** ✨

