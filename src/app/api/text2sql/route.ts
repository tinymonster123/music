import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import axios from "axios";
import { DatabaseConnection } from "../pieData/route";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session)
      
      return NextResponse.json(
        {
          success: false,
          error: "未登录",
        },
        { status: 401 }
      );

    if (!session.user) {
      return NextResponse.json(
        {
          success: false,
          error: "未经授权的访问，请先登录",
        },
        { status: 401 }
      );
    }

    const { question } = await req.json();

    if (!question || typeof question !== "string")
      return NextResponse.json(
        {
          success: false,
          error: "请求参数无效",
        },
        { status: 400 }
      );

    const accessToken = session.accessToken;

    if (accessToken) {
      const response = await axios.post(
        `${process.env.TEXT2SQL_URL}/api/text2sql`,
        {
          question: question,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = response.data;

      if (!data.success) {
        const errorData = data.data;
        throw new Error(errorData);
      }

      try {
        if (data.sql) {
          // 导入数据库连接
          const connectDBSSH = (await import("../connection/connection"))
            .default;
          const { connection } = (await connectDBSSH()) as DatabaseConnection;

          // 执行SQL查询
          const [rows, fields] = await connection.query(data.sql);

          // 获取列名
          const columns = fields ? fields.map((f: any) => f.name) : [];

          // 返回完整结果
          return NextResponse.json({
            ...data,
            data: rows,
            columns: columns,
          });
        }
      } catch (error: any) {
        console.error(error);
        return NextResponse.json(
          {
            ...data,
            dbError: error.message,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, error: "token 无效" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "处理请求时出错",
      },
      { status: 500 }
    );
  }
}
