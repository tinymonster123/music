// 创建新文件: /Users/lifenghan/Documents/music/music/src/lib/server/prisma.ts
// 这个文件只应该在服务端使用

import { PrismaClient } from "@prisma/client";
import { Client } from "ssh2";
import fs from "fs";

// SSH 配置
const sshConfig = {
  host: process.env.SSH_HOST || "",
  username: process.env.SSH_USER || "",
  privateKey: fs.readFileSync(process.env.SSH_KEY_PATH || ""),
};

// 创建 Prisma 客户端
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // 开发环境中确保只创建一个实例
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

// SSH 客户端
let sshClient: Client | null = null;

// 创建 SSH 隧道
export const createSSHTunnel = async () => {
  if (sshClient) {
    return sshClient;
  }

  return new Promise<Client>((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        conn.forwardOut("127.0.0.1", 0, "127.0.0.1", 3306, (error) => {
          if (error) {
            console.error(error);
            reject(error);
            return;
          }

          sshClient = conn;
          resolve(conn);
        });
      })
      .on("error", (error) => {
        reject(error);
      })
      .connect(sshConfig);
  });
};

// 初始化函数
export const initPrisma = async () => {
  try {
    await createSSHTunnel();
    return prisma;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 断开连接
export const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
  }

  if (sshClient) {
    sshClient.end();
    sshClient = null;
  }
};

export default prisma;
