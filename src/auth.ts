import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { authConfig } from "./auth.config"

// Use a global to avoid hot-reloading exhausting DB connections
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
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
          console.log("NextAuth authorize email:", email)
          try {
            const user = await prisma.user.findUnique({ where: { email } })
            console.log("NextAuth user found:", user?.email)

            if (!user) return null

            const passwordsMatch = await bcrypt.compare(password, user.password)
            console.log("NextAuth passwords match:", passwordsMatch)

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
            console.error("NextAuth prisma error:", error)
          }
        } else {
          console.log("NextAuth credentials validation failed", parsedCredentials.error)
        }
        return null
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.agentId = user.agentId
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
  }
})
