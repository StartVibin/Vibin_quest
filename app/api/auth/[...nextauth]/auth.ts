// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import { objectToAuthDataMap, AuthDataValidator } from "@telegram-auth/server";
// import SpotifyProvider from "next-auth/providers/spotify"

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       name: string;
//       image: string;
//       email: string;
//     };
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
//       ? [
//         GoogleProvider({
//           clientId: process.env.GOOGLE_CLIENT_ID,
//           clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         }),
//       ]
//       : []),

//     ...(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET
//       ? [
//         SpotifyProvider({
//           clientId: process.env.SPOTIFY_CLIENT_ID,
//           clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
//           authorization:
//             "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private",
//         }),
//       ]
//       : []),
//     CredentialsProvider({
//       id: "telegram-login",
//       name: "Telegram Login",
//       credentials: {},
//       async authorize(credentials, req) {
//         //console.log("Bot Token:", process.env.BOT_TOKEN ? "Set" : "Not set");

//         if (!process.env.BOT_TOKEN) {
//           //console.error("BOT_TOKEN environment variable is not set");
//           return null;
//         }

//         const validator = new AuthDataValidator({
//           botToken: `${process.env.BOT_TOKEN}`,
//         });

//         const data = objectToAuthDataMap(req.query || {});
//         //console.log("Received Telegram Auth Data:", data);

//         let user;
//         try {
//           user = await validator.validate(data);
//           //console.log("Validated Telegram User:", user);
//         } catch (error) {
//           console.error("Validation error:", error);
//           return null;
//         }

//         if (user && user.id && user.first_name) {
//           const returned = {
//             id: user.id.toString(),
//             email: user.id.toString(),
//             name: [user.first_name, user.last_name || ""].join(" "),
//             image: user.photo_url,
//           };

//           return returned;
//         }
//         return null;
//       },
//     }),
//   ],
//   secret : process.env.NEXTAUTH_SECRET,
  
//   callbacks: {
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = session.user.email || token.sub || '';
//       }
//       return session;
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//       }
//       return token;
//     },
//   },
//   pages: {
//     signIn: "/auth/signin",
//     error: "/auth/error",
//   },
//   debug: process.env.NODE_ENV === "development",
//   logger: {
//     error(code, ...message) {
//       console.error(`[NextAuth Error] ${code}:`, ...message);
//     },
//     warn(code, ...message) {
//       console.warn(`[NextAuth Warning] ${code}:`, ...message);
//     },
//     debug(code, ...message) {
//       if (process.env.NODE_ENV === "development") {
//         console.log(`[NextAuth Debug] ${code}:`, ...message);
//       }
//     },
//   },
// }; 