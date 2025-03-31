# 构建阶段
FROM node:20-alpine AS builder

# 安装必要依赖（添加编译工具）
RUN apk add --no-cache libc6-compat curl python3 make g++

# 使用 Corepack 安装 Yarn 4.6.0
RUN corepack enable && corepack prepare yarn@4.6.0 --activate


# 运行阶段工作目录
WORKDIR /app

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 设置 Yarn 配置
RUN mkdir -p ./.yarn
COPY .yarn ./.yarn
COPY .yarnrc.yml* ./
COPY .yarnrc.yml ./.yarnrc.yml

# 设置 registry 配置
# RUN yarn config set npmRegistryServer "https://registry.npmjs.org"

# 安装依赖
RUN yarn install

# 复制源代码
COPY . .

# 创建 SSH 目录
RUN mkdir -p /app/src/ssh && chmod 700 /app/src/ssh

# 创建 next.config.js（确保使用 JS 而非 TS）
RUN echo 'module.exports = require("./next.config.ts");' > next.config.js

# 构建应用
RUN yarn build

# 运行阶段
FROM node:20-alpine AS runner

# 添加运行时依赖
RUN apk add --no-cache libc6-compat

# 运行阶段工作目录
WORKDIR /app

# 从构建阶段复制必要文件
COPY --from=builder /app/next.config.js ./
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