import NextAuth, { type NextAuthOptions } from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"
import User from "@/models/user.model"
import mongoose from "mongoose"
import { createVerificationToken } from "./tokens"
import sendEmail from "./email"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: string
    image?: string
    username: string
  }

  interface Session {
    user: User & {
      id: string
      role: string
      username: string
      accessToken?: string
    }
    accessToken?: string
  }

  interface JWT {
    role?: string
    username?: string
    accessToken?: string
    id?: string
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set")
}

export const authConfig: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing required fields");
        }

        await connectDB();

        const user = await User.findOne({
          $or: [
            { email: credentials.email.toLowerCase() },
            { username: credentials.email.toLowerCase() }
          ]
        }).select('+password');

        if (!user) {
          throw new Error("Invalid email/username or password");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid email/username or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
        };
      }
    })
  ],
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          console.log("Google sign in attempt:", { user, profile });
          
          if (!user.email) {
            console.error("No email provided by Google");
            return false;
          }

          await connectDB();
          
          // Check if user exists
          let dbUser = await User.findOne({ email: user.email });
          
          if (!dbUser) {
            console.log("Creating new user for Google account");
            // Create new user
            dbUser = await User.create({
              email: user.email,
              name: user.name,
              emailVerified: true,
              image: user.image,
              username: user.email.split('@')[0],
              // Don't set role - user will select in onboarding
            });
          }

          // Update user object with database values
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.username = dbUser.username;
          
          console.log("Google sign in successful:", { user });
          return true;
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = user.role;
          token.username = user.username;
          if (account?.access_token) {
            token.accessToken = account.access_token;
          }
        }
        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.username = token.username as string;
          session.accessToken = token.accessToken as string;
        }
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },

    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl });
      
      // Always allow callback URLs
      if (url.startsWith('/api/auth/callback')) {
        return url;
      }
      
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allow URLs from the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      return baseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
