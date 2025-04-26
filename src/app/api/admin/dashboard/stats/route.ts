import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { getDashboardStats } from "@/lib/services/admin-dashboard"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const stats = await getDashboardStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[DASHBOARD_STATS_ERROR]', error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
