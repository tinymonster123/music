import fs from "fs";
import { Client } from "ssh2";

const createSSHTunnel = async (localPort: number) => {
  return new Promise<Client>((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        conn.forwardOut("127.0.0.1", localPort, "127.0.0.1", 3306, (error) => {
          if (error) reject(error);
          console.log("成功转发数据库");
          resolve(conn);
        });
      })
      .connect({
        host: process.env.SSH_HOST,
        username: process.env.SSH_USER,
        privateKey: fs.readFileSync(process.env.SSH_KEY_PATH || ""),
      });
  });
};

export default createSSHTunnel;
