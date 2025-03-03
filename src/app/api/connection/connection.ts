import { Client } from "ssh2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const sshConfig = {
  host: process.env.SSH_HOST || "",
  username: process.env.SSH_USER || "",
  privateKey: fs.readFileSync(process.env.SSH_KEY_PATH || ""),
};

// if (process.env.NODE_ENV === 'development') {
//   console.log("Database config:", {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD ? '***' : 'not set',
//     database: process.env.DB_NAME,
//   });
// }



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
              const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                stream: stream,
              });

              (await connection).ping()

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

export default connectDBSSH;
