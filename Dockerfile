# 构建阶段
FROM node:20-alpine AS builder

# 安装 yarn (改用 npm 安装)
RUN apk add --no-cache libc6-compat

# 使用 Corepack 安装 Yarn 4.6.0
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# 设置工作目录
WORKDIR /usr/src/melomane

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 运行阶段
FROM node:20-alpine AS runner

# 添加运行时依赖
RUN apk add --no-cache libc6-compat

# 运行阶段工作目录
WORKDIR /opt/melomane

# 从构建阶段复制必要文件
COPY --from=builder /usr/src/melomane/next.config.js ./
COPY --from=builder /usr/src/melomane/public ./public
COPY --from=builder /usr/src/melomane/.next/standalone ./
COPY --from=builder /usr/src/melomane/.next/static ./.next/static

# 设置环境变量 (修复警告)
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]