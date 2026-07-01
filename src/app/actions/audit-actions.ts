"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function uploadAuditRecords(records: any[]) {
  try {
    // Basic validation
    if (!records || !Array.isArray(records)) {
      throw new Error("Invalid records format")
    }

    // Convert string amounts and capacities to numbers
    const formattedRecords = records.map(record => {
      // Handle Date formats
      let date = new Date()
      if (record.date) {
         const parsed = new Date(record.date)
         if (!isNaN(parsed.getTime())) {
           date = parsed
         }
      }

      return {
        customer: String(record.customer || "Unknown"),
        mobile: record.mobile ? String(record.mobile) : null,
        date: date,
        capacity: Number(record.capacity) || 0,
        amount: Number(record.amount) || 0,
        salesperson: String(record.salesperson || "Unknown")
      }
    })

    // Batch insert using prisma
    await prisma.enterpriseAuditRecord.createMany({
      data: formattedRecords,
      skipDuplicates: true // Just in case
    })

    revalidatePath("/dashboard/analytics")
    return { success: true, message: `Successfully uploaded ${formattedRecords.length} records.` }
  } catch (error: any) {
    console.error("Upload error:", error)
    return { success: false, message: error.message || "Failed to upload records" }
  }
}

export async function getAuditRecords() {
    return await prisma.enterpriseAuditRecord.findMany({
        orderBy: { date: 'desc' }
    })
}
