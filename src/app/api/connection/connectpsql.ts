import { Pool } from "pg";
import { Client } from "ssh2";
import fs from "fs";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const sshConfig = {
  host: process.env.SSH_HOST || "",
  username: process.env.SSH_USER || "",
  privateKey: fs.readFileSync(process.env.SSH_KEY_PATH || ""),
};

const forwardPort = 5432;
const localPort = 5433;

let sshClient: Client | null = null;
let pgPool: Pool | null = null;

const createSSHTunnel = async (): Promise<Client> => {
  if (sshClient) {
    return sshClient;
  }

  return new Promise<Client>((resolve, reject) => {
    try {
      const conn = new Client();
      conn
        .on("ready", () => {
          conn.forwardOut(
            "127.0.0.1",
            localPort,
            "127.0.0.1",
            forwardPort,
            async (err) => {
              if (err) {
                console.error(err);
                reject(err);
                return;
              }

              console.log("创建 ssh 隧道");
              sshClient = conn;
              resolve(conn);
            }
          );
        })
        .on("error", (err) => {
          console.error(err);
          throw err;
        });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
};

const createPgPool = async (): Promise<Pool> => {
  if (pgPool) {
    return pgPool;
  }
  try {
    const clientSSH = await createSSHTunnel();
    const pool = new Pool(dbConfig);
    const client = await pool.connect();

    (await client).query(`Select 1`);

    console.log("连接数据库成功");
    pgPool = pool;
    return pool;
  } catch (err) {
    console.error(err);
    if (sshClient) {
      sshClient.end();
      sshClient = null;
    }
    throw err;
  }
};

export const connectPSQL = async () => {
  if (pgPool) {
    return { pool: pgPool, client: sshClient };
  }

  const pool = await createPgPool();
  return { pool, client: sshClient };
};

export const disconnect = async () => {
  try {
    if (pgPool) {
      await pgPool.end();
      pgPool = null;
      console.log("PostgreSQL连接池已关闭");
    }

    if (sshClient) {
      sshClient.end();
      sshClient = null;
      console.log("SSH连接已关闭");
    }
  } catch (error) {
    console.error("关闭连接时出错:", error);
  }
};

process.on("SIGINT", disconnect);
process.on("SIGTERM", disconnect);

export const getPgPool = async (pgPromise: Pool | null) => {
  if (!pgPromise) {
    const pgPoolPromise = await connectPSQL().then(({ pool }) => pool);
    pgPromise = pgPoolPromise;
  }

  return pgPromise;
};
