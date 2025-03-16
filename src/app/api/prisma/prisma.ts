import createSSHTunnel from "./sshtunnel";
import { Client } from "ssh2";
import { prisma } from "../../../../prisma";

const PrimsaStart = async (localPort: number) => {
  try {
    const conn: Client = await createSSHTunnel(localPort);

    process.env.DATABASE_URL = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${localPort}/${process.env.DB_NAME}?sslmode=prefer`;

    await prisma.$queryRaw`SELECT 1`;
    console.log(" 数据库连接成功");

    process.on("SIGINT", () => {
      conn.end();
      prisma.$disconnect();
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default PrimsaStart;
