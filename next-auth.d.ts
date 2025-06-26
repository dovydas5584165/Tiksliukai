import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's role */
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: string;
  }
}
