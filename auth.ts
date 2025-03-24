import NextAuth from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validation";
import { Pool } from "pg";

// 扩展会话接口以包含更多所需信息
// interface CustomSession {
//   user: {
//     id: string;
//     email: string;
//     name?: string;
//     image?: string;
//   };
//   // 添加会话令牌字段
//   sessionToken?: string;
//   expires: string;
// }

export const { handlers, auth, signIn, signOut } = NextAuth((req) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  return {
    adapter: PostgresAdapter(pool),
    providers: [
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID || "",
        clientSecret: process.env.AUTH_GITHUB_SECRET || "",
        profile(profile) {
          return {
            id: profile.id.toString(),
            name: profile.name || profile.login,
            email: profile.email,
            image: profile.avatar_url,
          };
        },
      }),
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
          try {
            const response = loginSchema.safeParse(credentials);
            if (!response.success) {
              console.error("验证失败");
              return null;
            }
            const { email, password } = response.data;
            const { rows } = await pool.query(
              `select * from users where email = $1`,
              [email]
            );

            const user = rows[0];

            if (!user || !user.password_hash) {
              return null;
            }

            const ifValid = await bcrypt.compare(password, user.password_hash);
            if (!ifValid) {
              return null;
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          } catch (error) {
            console.error(error);
            return null;
          }
        },
      }),
    ],
    pages: {
      signIn: "/pages/login",
      signOut: "/",
      newUser: "/",
    },
    session: {
      strategy: "jwt",
      // 增加会话过期时间为30天（如需更长时间）
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
      // 修改会话回调以添加会话令牌和用户ID
      async session({ session, token }) {
        // 确保用户ID正确传递
        if (session.user && token) {
          session.user.id = (
            (token.id as string) ||
            token.sub ||
            ""
          ).toString();
        }

        // 从请求Cookie中获取会话令牌并添加到会话对象
        if (req) {
          const sessionToken =
            req.cookies.get("next-auth.session-token")?.value ||
            req.cookies.get("__Secure-next-auth.session-token")?.value;

          // 将会话令牌添加到会话对象
          if (sessionToken) {
            (session as any).sessionToken = sessionToken;
          }
        }

        return session;
      },

      // 增强JWT令牌回调
      async jwt({ token, user, account }): Promise<typeof token> {
        // 初次登录时，将用户信息添加到令牌
        if (user) {
          token.id = user.id;
          // 可以添加更多用户信息
          token.email = user.email;
        }

        // 如果有OAuth账号信息，也可以添加
        if (account) {
          token.accessToken = account.access_token;
          token.provider = account.provider;
        }

        return token;
      },
    },
    // 启用调试模式（开发环境）
    debug: process.env.NODE_ENV === "development",
    // 确保令牌安全
    secret: process.env.NEXTAUTH_SECRET,
  };
});

// // 添加类型扩展
// declare module "next-auth" {
//   interface Session extends CustomSession {}
// }
