/**
 * API Route Authorization Helper
 * Wraps API handlers with session validation and role checks.
 */

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import type { Role } from "@/lib/authorization"

export type ApiContext = {
  userId: string
  userRole: string
  agentId?: string
}

/**
 * Validate the session for an API route.
 * Returns an ApiContext if authenticated, or a NextResponse 401 error.
 */
export async function requireApiAuth(
  allowedRoles?: Role[]
): Promise<ApiContext | NextResponse> {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    )
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as Role)) {
    return NextResponse.json(
      { success: false, message: `Access denied. Required role: ${allowedRoles.join(" or ")}` },
      { status: 403 }
    )
  }

  return {
    userId: session.user.id,
    userRole: session.user.role as string,
    agentId: session.user.agentId as string | undefined,
  }
}

/**
 * Type guard to check if requireApiAuth returned an error response.
 */
export function isAuthError(
  result: ApiContext | NextResponse
): result is NextResponse {
  return result instanceof NextResponse
}
