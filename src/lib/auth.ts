import { type NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { clientPromise, connectDB } from "./mongodb"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { User } from "@/models/user"
import { type UserRole } from "@/types/auth"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable')
}
if (!process.env.MONGODB_DB) {
  throw new Error('Please provide MONGODB_DB environment variable')
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: 'workmate',
    collections: {
      Users: 'users',
      Accounts: 'accounts',
      Sessions: 'sessions',
      VerificationTokens: 'verification_tokens',
    }
  }),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,    // refresh every 24 h
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password:        { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        await connectDB()
        const user = await User.findOne({
          $or: [
            { email: credentials.emailOrUsername.toLowerCase() },
            { username: credentials.emailOrUsername }
          ]
        }).select('+password')

        if (!user) {
          throw new Error("No account found")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        // ← NEW: if not verified, throw with the real email
        if (!user.emailVerified) {
          throw new Error(`EmailNotVerified:${user.email}`)
        }

        return {
          id:       user._id.toString(),
          name:     user.name,
          email:    user.email,
          role:     user.role,
          type:     user.learnerProfile?.type || 'independent',
          parentId: user.learnerProfile?.parent
        }
      }
    }),
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (trigger === "update" && token.id) {
        const refreshed = await User.findById(token.id)
          .select('-password')
          .lean()
        if (refreshed) {
          token.role          = refreshed.role
          token.emailVerified = refreshed.emailVerified
        }
      }
      if (user) {
        token.id            = user.id
        token.role          = user.role
        token.emailVerified = (user as any).emailVerified
        token.username      = (user as any).username
        if (account?.accessToken) token.accessToken = account.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id:            token.id as string,
          role:          token.role as UserRole,
          emailVerified: token.emailVerified as boolean,
          username:      token.username as string,
          accessToken:   token.accessToken
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/sign-in') || url.includes('/sign-up')) {
        return baseUrl + '/dashboard'
      }
      if (url.includes('/dashboard')) {
        return url
      }
      return baseUrl
    }
  },
  pages: {
    signIn:        "/sign-in",
    error:         "/auth/error",
    verifyRequest: "/auth/verify"
  },
  debug: process.env.NODE_ENV === "development"
}

export default authOptions
export const getAuthSession = () => getServerSession(authOptions)
export async function getCurrentUser() {
  const session = await getAuthSession()
  return session?.user
}
