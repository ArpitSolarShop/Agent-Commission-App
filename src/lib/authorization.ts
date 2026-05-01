/**
 * Centralized Authorization Module
 * Implements three access control models:
 *   - RBAC (Role-Based Access Control)
 *   - ABAC (Attribute-Based Access Control)
 *   - ReBAC (Relationship-Based Access Control)
 */

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "SALESPERSON" | "AGENT"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  agentId?: string
}

export type Relationship = "OWNER" | "ANCESTOR" | "ASSIGNED" | "NONE"

export interface AttributeRule {
  field: string
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "in" | "nin"
  value: unknown
}

export class AuthorizationError extends Error {
  public statusCode: number
  constructor(message: string, statusCode: number = 403) {
    super(message)
    this.name = "AuthorizationError"
    this.statusCode = statusCode
  }
}

// ─────────────────────────────────────────────────────────────────
// Session Helper
// ─────────────────────────────────────────────────────────────────

/**
 * Get the current session and throw 401 if not authenticated.
 */
export async function getSessionOrThrow(): Promise<SessionUser> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new AuthorizationError("Authentication required. Please log in.", 401)
  }
  return session.user as SessionUser
}

// ─────────────────────────────────────────────────────────────────
// RBAC — Role-Based Access Control
// ─────────────────────────────────────────────────────────────────

/**
 * Ensure the user has one of the allowed roles.
 * Throws AuthorizationError if the check fails.
 *
 * @example
 *   const user = await getSessionOrThrow()
 *   requireRole(user, "ADMIN")
 *   requireRole(user, "ADMIN", "SALESPERSON")
 */
export function requireRole(user: SessionUser, ...allowedRoles: Role[]): void {
  if (!allowedRoles.includes(user.role as Role)) {
    throw new AuthorizationError(
      `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${user.role}.`
    )
  }
}

/**
 * Check if the user has one of the allowed roles (non-throwing).
 */
export function hasRole(user: SessionUser, ...roles: Role[]): boolean {
  return roles.includes(user.role as Role)
}

// ─────────────────────────────────────────────────────────────────
// ABAC — Attribute-Based Access Control
// ─────────────────────────────────────────────────────────────────

/**
 * Evaluate attribute-based rules against a resource object.
 * All rules must pass for access to be granted.
 *
 * @example
 *   checkAttributes(deal, [
 *     { field: "status", operator: "eq", value: "OPEN" },
 *     { field: "dealValue", operator: "gt", value: 0 },
 *   ])
 */
export function checkAttributes(
  resource: Record<string, unknown>,
  rules: AttributeRule[],
  errorMessage?: string
): void {
  for (const rule of rules) {
    const actual = resource[rule.field]
    let passed = false

    switch (rule.operator) {
      case "eq":
        passed = actual === rule.value
        break
      case "neq":
        passed = actual !== rule.value
        break
      case "gt":
        passed = (actual as number) > (rule.value as number)
        break
      case "lt":
        passed = (actual as number) < (rule.value as number)
        break
      case "gte":
        passed = (actual as number) >= (rule.value as number)
        break
      case "lte":
        passed = (actual as number) <= (rule.value as number)
        break
      case "in":
        passed = (rule.value as unknown[]).includes(actual)
        break
      case "nin":
        passed = !(rule.value as unknown[]).includes(actual)
        break
    }

    if (!passed) {
      throw new AuthorizationError(
        errorMessage ||
          `Access denied. Attribute check failed: ${rule.field} ${rule.operator} ${JSON.stringify(rule.value)} (actual: ${JSON.stringify(actual)}).`
      )
    }
  }
}

/**
 * Non-throwing version of checkAttributes.
 */
export function matchesAttributes(
  resource: Record<string, unknown>,
  rules: AttributeRule[]
): boolean {
  try {
    checkAttributes(resource, rules)
    return true
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────
// ReBAC — Relationship-Based Access Control
// ─────────────────────────────────────────────────────────────────

/**
 * Resolve the relationship between the current user and a lead.
 * Walks the agent hierarchy graph to determine access.
 *
 * Relationships (in priority order):
 *   OWNER    — The user's agent directly owns this lead
 *   ASSIGNED — The user's agent is explicitly assigned to this lead
 *   ANCESTOR — The user's agent is an ancestor (parent/grandparent) of the lead owner
 *   NONE     — No relationship found
 */
export async function resolveLeadRelationship(
  user: SessionUser,
  leadId: string
): Promise<Relationship> {
  if (hasRole(user, "ADMIN")) return "OWNER" // Admins have full access

  if (!user.agentId) return "NONE"

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      ownerId: true,
      assignments: { select: { agentId: true } },
    },
  })

  if (!lead) return "NONE"

  // Direct ownership
  if (lead.ownerId === user.agentId) return "OWNER"

  // Explicit assignment
  if (lead.assignments.some((a) => a.agentId === user.agentId)) return "ASSIGNED"

  // Ancestor check: walk UP from lead owner to see if user is in the chain
  const isAncestor = await isAncestorOf(user.agentId, lead.ownerId)
  if (isAncestor) return "ANCESTOR"

  return "NONE"
}

/**
 * Resolve the relationship between the current user and a deal.
 * Delegates to the underlying lead relationship + commission check.
 */
export async function resolveDealRelationship(
  user: SessionUser,
  dealId: string
): Promise<Relationship> {
  if (hasRole(user, "ADMIN")) return "OWNER"

  if (!user.agentId) return "NONE"

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: {
      leadId: true,
      commissions: { select: { agentId: true } },
    },
  })

  if (!deal) return "NONE"

  // Check if user has a commission on this deal
  if (deal.commissions.some((c) => c.agentId === user.agentId)) return "OWNER"

  // Fallback to lead relationship
  return resolveLeadRelationship(user, deal.leadId)
}

/**
 * Check if ancestorId is an ancestor of descendantId in the agent hierarchy graph.
 * Walks UP from the descendant, following parentId edges.
 * Includes cycle detection to prevent infinite loops in corrupted data.
 */
export async function isAncestorOf(
  ancestorId: string,
  descendantId: string
): Promise<boolean> {
  const visited = new Set<string>()
  let currentId: string | null = descendantId

  while (currentId) {
    if (visited.has(currentId)) break // Cycle guard
    visited.add(currentId)

    const agent: { parentId: string | null } | null = await prisma.agent.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })

    if (!agent?.parentId) break
    if (agent.parentId === ancestorId) return true

    currentId = agent.parentId
  }

  return false
}

/**
 * Get all descendant agent IDs (the full subtree) for a given agent.
 * Useful for scoping queries: "show me leads from my entire team".
 */
export async function getSubtreeAgentIds(agentId: string): Promise<string[]> {
  if (!agentId) return []
  const result: string[] = [agentId]
  const queue: string[] = [agentId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const children = await prisma.agent.findMany({
      where: { parentId: currentId },
      select: { id: true },
    })
    for (const child of children) {
      result.push(child.id)
      queue.push(child.id)
    }
  }

  return result
}

/**
 * Require a specific relationship to a lead. Throws if not met.
 */
export async function requireLeadAccess(
  user: SessionUser,
  leadId: string,
  ...allowedRelationships: Relationship[]
): Promise<Relationship> {
  const rel = await resolveLeadRelationship(user, leadId)
  if (!allowedRelationships.includes(rel)) {
    throw new AuthorizationError(
      "You do not have permission to access this lead."
    )
  }
  return rel
}

/**
 * Require a specific relationship to a deal. Throws if not met.
 */
export async function requireDealAccess(
  user: SessionUser,
  dealId: string,
  ...allowedRelationships: Relationship[]
): Promise<Relationship> {
  const rel = await resolveDealRelationship(user, dealId)
  if (!allowedRelationships.includes(rel)) {
    throw new AuthorizationError(
      "You do not have permission to access this deal."
    )
  }
  return rel
}
