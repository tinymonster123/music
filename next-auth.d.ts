import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
    sessionToken?: string;
  }

  interface JWT {
    id?: string;
    accessToken?: string;
    provider?: string;
  }
}
