# 构建阶段
FROM node:20-bookworm AS builder

# 设置工作目录
WORKDIR /app

# 更新软件源并安装必要依赖，完成后清理缓存减小镜像体积
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    ca-certificates \
    && apt-get clean \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# 启用 Corepack 并安装特定版本的 Yarn
RUN corepack enable && yarn set version 4.6.0

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 复制 .yarnrc.yml 文件（如果存在）
COPY .yarnrc.yml ./

COPY public ./public

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TURBO=1
ENV NEXT_DISABLE_PRERENDER=true
ENV NEXT_DISABLE_SSG=true
ENV NEXT_MINIMAL_BUILD=false

# 安装依赖
RUN yarn install

# 复制源代码
COPY . .

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
FROM node:20-bookworm-slim AS runner

# 运行阶段工作目录
WORKDIR /app

# 安全更新
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends ca-certificates && \
    apt-get clean && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# 创建非root用户
RUN groupadd -r nextjs && useradd -r -g nextjs nextjs

# 启用 Corepack 并设置 Yarn 版本
RUN corepack enable && yarn set version 4.6.0

# 创建 SSH 目录
RUN mkdir -p /app/src/ssh && chmod 700 /app/src/ssh

# 复制应用文件
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/src/assets ./src/assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static/css ./.next/static/css
COPY --from=builder /app/.next/server ./server

# 设置正确的文件所有权
RUN chown -R nextjs:nextjs /app

# 切换到非root用户
USER nextjs

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]