import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      shopId: number | null;
      shopName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    shopId?: number | null;
    shopName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    shopId?: number | null;
    shopName?: string | null;
  }
}