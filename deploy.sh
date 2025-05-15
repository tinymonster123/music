#!/bin/bash

# 确保脚本在错误时退出
set -e

# 创建 secrets 目录（如果不存在）
mkdir -p secrets

# 从环境变量创建 secret 文件
echo "$SSH_PRIVATE_KEY" > secrets/ssh_private_key.txt
echo "$DATABASE_URL" > secrets/database_url.txt
echo "$DB_USER" > secrets/db_user.txt
echo "$DB_PASSWORD" > secrets/db_password.txt
echo "$DB_HOST" > secrets/db_host.txt
echo "$DB_PORT" > secrets/db_port.txt
echo "$DB_NAME" > secrets/db_name.txt
echo "$AUTHORIZE_URL" > secrets/authorize_url.txt
echo "$BASE_URL" > secrets/base_url.txt
echo "$TEXT2SQL_URL" > secrets/text2sql_url.txt
echo "$NEXTAUTH_SECRET" > secrets/nextauth_secret.txt
echo "$NEXTAUTH_URL" > secrets/nextauth_url.txt
echo "$AUTH_GITHUB_ID" > secrets/auth_github_id.txt
echo "$AUTH_GITHUB_SECRET" > secrets/auth_github_secret.txt

# 设置文件权限
chmod 600 secrets/*.txt

# 部署服务
docker stack deploy -c docker-compose.prod.yml nextjs-app

# 清理敏感文件
rm -rf secrets/ 