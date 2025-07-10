import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { objectToAuthDataMap, AuthDataValidator } from "@telegram-auth/server";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      image: string;
      email: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "telegram-login",
      name: "Telegram Login",
      credentials: {},
      async authorize(credentials, req) {
        console.log("Bot Token:", process.env.BOT_TOKEN ? "Set" : "Not set");
        
        if (!process.env.BOT_TOKEN) {
          console.error("BOT_TOKEN environment variable is not set");
          return null;
        }

        const validator = new AuthDataValidator({
          botToken: `${process.env.BOT_TOKEN}`,
        });

        const data = objectToAuthDataMap(req.query || {});
        console.log("Received Telegram Auth Data:", data);
        
        let user;
        try {
          user = await validator.validate(data);
          console.log("Validated Telegram User:", user);
        } catch (error) {
          console.error("Validation error:", error);
          return null;
        }

        if (user && user.id && user.first_name) {
          const returned = {
            id: user.id.toString(),
            email: user.id.toString(),
            name: [user.first_name, user.last_name || ""].join(" "),
            image: user.photo_url,
          };

          return returned;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      session.user.id = session.user.email;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 