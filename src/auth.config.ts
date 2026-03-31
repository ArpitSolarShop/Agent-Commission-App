import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/") && nextUrl.pathname !== "/login"
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect to /login
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
  providers: [], // Add providers array here so we can satisfy NextAuthConfig
} satisfies NextAuthConfig
