import { NextRequest } from "next/server";
import axios from "axios";
import { withAuth, ApiErrorResponse } from "../middleware/auth";

interface DatabaseConnection {
  connection: any;
  conn: any;
}

export const POST = async (req: NextRequest) => {
  return withAuth(req, async (req, session) => {
    const reqBody = await req.json();
    const { question } = reqBody;

    if (!question || typeof question !== "string") {
      throw new ApiErrorResponse("请求参数无效", 400, "INVALID_PARAMS");
    }

    const sessionToken = session.user.email;
    if (!sessionToken) {
      throw new ApiErrorResponse("email 提取失败，请重新登录", 400, "EMAIL_MISSING");
    }

    try {
      const response = await axios.get(
        `${process.env.TEXT2SQL_URL}/api/generate-token/${encodeURIComponent(sessionToken)}`,
        { timeout: 10000 }
      );

      const data = response.data;
      if (!data?.token) {
        throw new ApiErrorResponse("获取认证令牌失败，服务器响应无效", 400, "TOKEN_MISSING");
      }

      const sqlResponse = await axios.post(
        `${process.env.TEXT2SQL_URL}/api/text2sql`,
        { question },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      const sqlData = sqlResponse.data;
      if (!sqlData.success) {
        throw new ApiErrorResponse(sqlData.error || "SQL生成失败", 400, "SQL_GENERATION_FAILED");
      }

      if (!sqlData.sql) {
        throw new ApiErrorResponse("生成 SQL 为空", 400, "EMPTY_SQL");
      }

      const connectDBSSH = (await import("../connection/connection")).default;
      const { connection } = (await connectDBSSH()) as DatabaseConnection;

      const [rows, fields] = await connection.query(sqlData.sql);
      const columns = fields ? fields.map((f: any) => f.name) : [];

      return {
        ...data,
        data: rows,
        columns: columns,
        sql: sqlData.sql,
      };
    } catch (error: any) {
      if (error instanceof ApiErrorResponse) {
        throw error;
      }

      if (error.response?.data?.error) {
        throw new ApiErrorResponse(`API调用失败: ${error.response.data.error}`, 400, "API_ERROR");
      }

      if (error.code === 'ECONNREFUSED') {
        throw new ApiErrorResponse("无法连接到外部服务", 503, "SERVICE_UNAVAILABLE");
      }

      throw new ApiErrorResponse(error.message || "处理请求时出错", 500, "UNKNOWN_ERROR");
    }
  });
};
