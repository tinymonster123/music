import NextAuth from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";
import { getPgPool } from "@/app/api/connection/connectpsql";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

let pgPromise: any;

pgPromise = getPgPool(pgPromise);

export const config = {
  adapter: PostgresAdapter(pgPromise),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  basePath: "/auth",
  callbacks: {
    jwt({ token, trigger, session }) {
      if (trigger === "update") token.name = session.user.name;
      return token;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);
