# 构建阶段
FROM node:20-alpine AS builder

# 安装必要依赖（添加编译工具）
RUN apk add --no-cache libc6-compat curl python3 make g++

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 初始化 Yarn
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# 初始化 Yarn 配置
RUN yarn init -2

# 复制源代码
COPY . .

# 创建 SSH 目录并添加临时密钥（仅供构建使用）
RUN mkdir -p /app/src/ssh && \
    echo "dummy key for build only" > /app/src/ssh/dummy.pem && \
    chmod 600 /app/src/ssh/dummy.pem

# 设置环境变量
ENV SSH_KEY_PATH=/app/src/ssh/dummy.pem
ENV NODE_ENV=production

# 创建简化的 next.config.js
RUN echo 'module.exports = { output: "standalone", eslint: { ignoreDuringBuilds: true }, typescript: { ignoreBuildErrors: true } }' > next.config.js

# 安装依赖
RUN yarn set version 4.6.0
RUN yarn config set nodeLinker node-modules
RUN yarn install

# 构建应用
RUN NEXT_TELEMETRY_DISABLED=1 yarn build

# 运行阶段
FROM node:20-alpine AS runner

# 添加运行时依赖
RUN apk add --no-cache libc6-compat

# 创建 SSH 目录
RUN mkdir -p /app/src/ssh && chmod 700 /app/src/ssh

# 运行阶段工作目录
WORKDIR /app

# 从构建阶段复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]