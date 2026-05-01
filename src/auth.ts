import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          try {
            const user = await prisma.user.findUnique({ where: { email } })

            if (!user || !user.password) return null

            const passwordsMatch = await bcrypt.compare(password, user.password)

            if (passwordsMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                agentId: user.agentId,
              }
            }
          } catch (error) {
            console.error("Auth error:", error)
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        // Handle OAuth vs Credentials users
        // If OAuth, `user` might not have `role` typed properly, but it's in DB
        // Let's explicitly fetch from DB if needed, or trust the adapter provides it
        token.role = (user as any).role || "AGENT"
        token.agentId = (user as any).agentId
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.agentId = token.agentId as string | undefined
      }
      return session
    }
  },
  events: {
    async createUser({ user }) {
      // Check if this is the first user to sign up via Google
      const googleAccountCount = await (prisma as any).account.count({ 
        where: { provider: "google" } 
      })
      
      // If this is the first Google user, make them ADMIN
      if (googleAccountCount === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" }
        })
        console.log(`>>> Google Bootstrap: First Google user ${user.email} promoted to ADMIN`)
      }
    }
  }
})
