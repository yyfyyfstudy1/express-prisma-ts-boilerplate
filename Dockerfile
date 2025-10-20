# ============================================
# Stage 1: Builder - 构建 TypeScript
# ============================================
FROM node:20-slim AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# 安装所有依赖（包括 devDependencies）
RUN npm ci

# 复制源代码
COPY src ./src
COPY public ./public

# 生成 Prisma Client
RUN npx prisma generate

# 构建 TypeScript 并复制静态文件
RUN npm run build && \
    npx copyfiles -u 1 src/views/**/*.* build/src/ && \
    npx copyfiles -u 1 src/utils/nodemailer/templates/**/*.* build/src/ && \
    npx copyfiles -u 1 public/**/*.* build/public/

# ============================================
# Stage 2: Production - 运行应用
# ============================================
FROM node:20-slim

WORKDIR /app

# 安装 dumb-init 和必要的依赖 (优雅处理信号)
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -m -s /bin/bash nodejs

# 复制依赖文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && \
    npm cache clean --force

# 从 builder 复制构建产物
COPY --from=builder --chown=nodejs:nodejs /app/build ./build
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# 复制 Prisma schema (运行时需要)
COPY --chown=nodejs:nodejs prisma ./prisma

# 复制公共资源
COPY --chown=nodejs:nodejs public ./public

# 创建 logs 目录并设置权限
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3344

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3344/api/info', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 使用 dumb-init 启动应用
ENTRYPOINT ["dumb-init", "--"]

# 运行生产应用
CMD ["node", "build/src/app.js"]

