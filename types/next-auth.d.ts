import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      agentId?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    agentId?: string | null
  }
}
