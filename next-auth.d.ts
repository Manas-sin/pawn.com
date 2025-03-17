import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    isNewUser?: boolean;
  }
}