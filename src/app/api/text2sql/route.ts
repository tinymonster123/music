import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import axios from "axios";
import { DatabaseConnection } from "../pieData/route";

export async function POST(req: NextRequest) {
  try {
    console.log("====== Text2SQL API 请求开始 ======");
    const session = await auth();
    console.log("Session对象:", JSON.stringify(session, null, 2));

    if (!session) {
      console.log("未检测到会话");
      return NextResponse.json(
        {
          success: false,
          error: "未登录",
        },
        { status: 401 }
      );
    }

    if (!session.user) {
      console.log("会话中无用户信息");
      return NextResponse.json(
        {
          success: false,
          error: "未经授权的访问，请先登录",
        },
        { status: 401 }
      );
    }

    // 解析请求参数
    let reqBody;
    try {
      reqBody = await req.json();
      console.log("请求参数:", reqBody);
    } catch (parseError) {
      console.error("解析请求体失败:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "无法解析请求体",
        },
        { status: 400 }
      );
    }

    const { question } = reqBody;

    if (!question || typeof question !== "string") {
      console.log("查询参数无效:", question);
      return NextResponse.json(
        {
          success: false,
          error: "请求参数无效",
        },
        { status: 400 }
      );
    }

    const sessionToken = session.user.email;

    console.log("提取用户的邮箱:", sessionToken ? "存在" : "不存在");

    if (!sessionToken) {
      console.log("未找到用户邮箱");
      return NextResponse.json(
        { success: false, error: "email 提取失败，请重新登录" },
        { status: 400 }
      );
    }

    console.log("使用令牌调用外部API");
    try {
      const response = await axios.get(
        `${process.env.TEXT2SQL_URL}/api/generate-token/${encodeURIComponent(
          sessionToken
        )}`,
        {
          timeout: 10000,
        }
      );

      const data = response.data;
      console.log("API响应:", data);

      if (!data || !data.token) {
        console.error("缺少token字段:", data);
        return NextResponse.json(
          { success: false, error: "获取认证令牌失败，服务器响应无效" },
          { status: 400 }
        );
      }

      let sql;

      const token = data.token;
      console.log(`成功获得 token:${token}`);

      try {
        const response = await axios.post(
          `${process.env.TEXT2SQL_URL}/api/text2sql`,
          {
            question: question,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const sqlData = response.data;

        if (!sqlData.success) {
          console.error("API返回错误:", data);
          return NextResponse.json(
            {
              success: false,
              error: sqlData.error || "SQL生成失败",
            },
            { status: 400 }
          );
        }

        if (!sqlData.sql) {
          return NextResponse.json(
            {
              success: false,
              error: sqlData.error || "生成 SQL 为空",
            },
            { status: 400 }
          );
        }
        sql = sqlData.sql;
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error || "未知错误",
        });
      }

      if (sql) {
        try {
          // 导入数据库连接
          const connectDBSSH = (await import("../connection/connection"))
            .default;
          const { connection } = (await connectDBSSH()) as DatabaseConnection;

          // 执行SQL查询
          console.log("执行SQL查询");
          const [rows, fields] = await connection.query(sql);

          // 获取列名
          const columns = fields ? fields.map((f: any) => f.name) : [];

          console.log("查询成功，返回结果");
          // 返回完整结果
          return NextResponse.json({
            ...data,
            data: rows,
            columns: columns,
            status: 200,
            success: true,
          });
        } catch (error: any) {
          console.error("数据库查询错误:", error);
          return NextResponse.json(
            {
              ...data,
              dbError: error.message,
              status: 200,
              success: false,
            },
            { status: 200 }
          );
        }
      }

      return NextResponse.json({
        ...data,
        status: 200,
        success: true,
      });
    } catch (apiError: any) {
      console.error("API调用错误:", apiError);
      const errorMessage = apiError.response?.data?.error || apiError.message;
      throw new Error(`API调用失败: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error("处理请求时出错:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "处理请求时出错",
        status: 500,
      },
      { status: 500 }
    );
  } finally {
    console.log("====== Text2SQL API 请求结束 ======");
  }
}
