import { Client } from "ssh2";
import mysql from "mysql2/promise";
import fs from "fs";

const forwardPort = 3306;

let pool: mysql.Pool | null = null;
let sshClient: Client | null = null;

const connectDBSSH = async () => {
  if (pool) {
    return { connection: pool, conn: sshClient };
  }

  // 移到函数内部，运行时读取
  let privateKey;
  try {
    privateKey = fs.readFileSync(process.env.SSH_KEY_PATH || "", "utf8");
  } catch (error) {
    console.error("Failed to read SSH key:", error);
    throw new Error("SSH key could not be loaded");
  }

  const sshConfig = {
    username: process.env.SSH_USER || "",
    host: process.env.SSH_HOST || "",
    privateKey: privateKey,
  };

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    queueLimit: 0,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    // keepAliveINitialDelay: 10000,
  };

  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        conn.forwardOut(
          "127.0.0.1",
          33306,
          "127.0.0.1",
          forwardPort,
          async (error, stream) => {
            if (error) {
              reject(error);
            }

            try {
              const pool = await mysql.createPool({
                ...dbConfig,
                stream: stream,
              });

              // (await pool).ping();

              sshClient = conn;

              resolve({ connection: pool, conn });
            } catch (dbError) {
              conn.end();
              reject(dbError);
            }
          }
        );
      })
      .on("error", (error) => reject(error))
      .connect(sshConfig);
  });
};

export default connectDBSSH;
