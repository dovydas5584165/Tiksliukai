import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          console.log("No credentials provided");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        console.log("User found:", user);

        if (!user) {
          console.log("User not found for email:", credentials.email);
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        console.log("Password valid:", isValid);

        if (!isValid) {
          console.log("Invalid password for user:", credentials.email);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/log-in",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
