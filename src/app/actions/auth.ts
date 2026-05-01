"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function registerUser(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = RegisterSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password } = parsed.data

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "User with this email already exists" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Create User (default role AGENT)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "AGENT",
      }
    })
    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Internal server error" }
  }
}
