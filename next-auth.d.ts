import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    isVerified?: boolean;
    role?: "user" | "admin";
  }
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      role?: "user" | "admin";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    role?: "user" | "admin";
  }
}
