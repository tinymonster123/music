import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

// 创建数据库连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体
    const body = await req.json();

    // 验证输入
    const validation = registerSchema.safeParse(body);

    // 如果验证失败
    if (!validation.success) {
      const formatted = validation.error.format();
      console.error("注册验证失败:", formatted);
      return NextResponse.json(
        { error: "注册验证失败，请检查输入" },
        { status: 400 }
      );
    }

    // 获取验证后的数据
    const { email, password } = validation.data;

    // 检查邮箱是否已存在
    const { rows: existingUsers } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    const name = email.split("@")[0];
    const image = "https://xsgames.co/randomusers/avatar.php?g=pixel";

    // 创建新用户
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash, name, image) VALUES ($1, $2, $3, $4) RETURNING id, email, name, image",
      [email, hashedPassword, name, image]
    );

    // 返回成功响应，不包含敏感信息
    return NextResponse.json(
      {
        message: "注册成功",
        user: {
          id: rows[0].id,
          email: rows[0].email,
          name: rows[0].name,
          image: rows[0].image,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
