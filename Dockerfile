# 构建阶段
FROM node:20-bullseye AS builder

# 设置工作目录
WORKDIR /app

# 更新软件源并安装必要依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 启用 Corepack 并安装特定版本的 Yarn
RUN corepack enable && yarn set version 4.6.0

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 复制 .yarnrc.yml 文件（如果存在）
COPY .yarnrc.yml ./

# 创建 SSH 目录并添加临时密钥（仅供构建使用）
RUN mkdir -p /app/src/ssh && \
    echo "dummy key for build only" > /app/src/ssh/dummy.pem && \
    chmod 600 /app/src/ssh/dummy.pem

# 设置临时环境变量
ENV SSH_KEY_PATH=/app/src/ssh/dummy.pem
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# 在构建之前添加环境变量以禁用静态优化
ENV NEXT_DISABLE_PRERENDER=true
ENV NEXT_DISABLE_SSG=true


# 安装依赖
RUN yarn install

# 复制源代码
COPY . .

# 修改 connection.ts 文件，防止构建时读取空路径
RUN sed -i 's/fs.readFileSync(process.env.SSH_KEY_PATH || "")/fs.readFileSync(process.env.SSH_KEY_PATH || "\/app\/src\/ssh\/dummy.pem")/g' src/app/api/connection/connection.ts || echo "Connection file pattern not matched"

# 修改 connection.ts 的另一种方法（如果上面的不匹配）
# RUN grep -q "fs.readFileSync" src/app/api/connection/connection.ts && \
#     echo "修改 connection.ts 文件" && \
#     sed -i '/fs.readFileSync/ s/process.env.SSH_KEY_PATH || ""/process.env.SSH_KEY_PATH || "\/app\/src\/ssh\/dummy.pem"/g' src/app/api/connection/connection.ts || \
#     echo "无法找到模式，可能需要手动检查代码"

# 添加启动脚本
RUN if ! grep -q '"start"' package.json; then \
    sed -i 's/"scripts": {/"scripts": {\n    "start": "next start",/g' package.json; \
    fi

# 添加构建脚本
RUN if ! grep -q '"build"' package.json; then \
    sed -i 's/"scripts": {/"scripts": {\n    "build": "next build",/g' package.json; \
    fi

# 构建应用
RUN yarn build

# 检查构建结果
RUN ls -la .next/ || echo "未找到 .next 目录"

# 运行阶段
FROM node:20-bullseye-slim AS runner

# 运行阶段工作目录
WORKDIR /app

# 启用 Corepack 并设置 Yarn 版本（新增这行）
RUN corepack enable && yarn set version 4.6.0

# 创建 SSH 目录
RUN mkdir -p /app/src/ssh && chmod 700 /app/src/ssh

# 方案一：复制完整应用（适用于未成功生成 standalone 模式）
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# 方案二：如果生成了 standalone 模式，则取消下面的注释
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动应用（适用于方案一：完整应用）
# CMD ["yarn", "start"]

# 启动应用（适用于方案二：standalone 模式）
CMD ["node", "server.js"]