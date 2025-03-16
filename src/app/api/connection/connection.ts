import { Client } from "ssh2";
import mysql from "mysql2/promise";
import fs from "fs";



const sshConfig = {
  host: process.env.SSH_HOST || "",
  username: process.env.SSH_USER || "",
  privateKey: fs.readFileSync(process.env.SSH_KEY_PATH || ""),
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

const forwardPort = 3306;

let pool: mysql.Pool | null = null;
let sshClient: Client | null = null;

const connectDBSSH = async () => {
  if (pool) {
    return { connection: pool, conn: sshClient };
  }

  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        conn.forwardOut(
          "127.0.0.1",
          0,
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
