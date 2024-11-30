import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import type { Account, Profile, User as NextAuthUser, Session } from "next-auth"
import type { Adapter } from "@auth/core/adapters"
import type { JWT } from "next-auth/jwt"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getMongoClient } from "@/lib/mongodb"
import User from "@/models/user.model"
import { connectDB } from "@/lib/mongodb"
import mongoose from "mongoose"
import { createVerificationToken } from "./tokens"
import sendEmail from "./email"

// Define base types without recursion
interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string | null;
  username?: string;
  emailVerified?: boolean;
  password?: string;
  accessToken?: string;
}

// Extend next-auth module
declare module "next-auth" {
  interface User extends BaseUser {}
  
  interface Session {
    user: BaseUser & {
      accessToken?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT extends BaseUser {
    accessToken?: string;
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set")
}

export const authOptions: NextAuthConfig = {
  adapter: MongoDBAdapter(getMongoClient()),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<BaseUser | null> {
        try {
          await connectDB();

          if (!credentials?.email || !credentials?.password || 
              typeof credentials.email !== 'string' || 
              typeof credentials.password !== 'string') {
            throw new Error("Missing required fields");
          }

          const user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.password) {
            throw new Error("Please sign in with Google");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || '',
            role: user.role || "student",
            username: user.username || user.email.split("@")[0],
            emailVerified: user.emailVerified || false,
            image: user.image || null,
          };
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async signIn(params) {
      const { user, account, profile } = params;
      
      if (!user?.email) {
        return false;
      }

      if (account?.provider === "google") {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            const newUser = new User({
              email: user.email,
              name: user.name || '',
              image: user.image || null,
              emailVerified: true,
              role: "student",
              username: user.email.split("@")[0],
            });
            await newUser.save();
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }): Promise<JWT> {
      if (user) {
        token.id = user.id || ''
        token.email = user.email || ''
        token.name = user.name || ''
        token.role = (user as BaseUser).role || 'student'
        token.image = user.image || null
        if (account?.access_token) {
          token.accessToken = account.access_token
        }
      }
      return token
    },
    async session({ session, token }): Promise<Session> {
      if (session?.user) {
        session.user.id = token.id || ''
        session.user.email = token.email || ''
        session.user.name = token.name || ''
        session.user.role = token.role || 'student'
        session.user.image = token.image || null
        if (token.accessToken) {
          session.user.accessToken = token.accessToken
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
