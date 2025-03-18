import NextAuth from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validation";
import { Pool } from "pg";
import { isValid } from "zod";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//     } & DefaultSession["user"];
//   }
// }

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
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
            if (!isValid) {
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
    },
  };
});
