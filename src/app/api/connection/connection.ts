import { Client } from "ssh2";
import mysql from "mysql2";
import dotenv from "dotenv";
import fs from "fs";


dotenv.config();

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
};

const forwardPort = 3306;

const connectDBSSH = async () => {
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
              const connection = mysql.createConnection({
                ...dbConfig,
                stream: stream,
              });

              resolve({ connection, conn });
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

export default connectDBSSH
