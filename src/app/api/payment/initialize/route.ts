import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { calculateTutorialCost, generatePaymentRef } from "@/lib/flutterwave"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { numberOfStudents, hoursPerSession, sessionsPerWeek } = body

    const amount = calculateTutorialCost(5, numberOfStudents, hoursPerSession, sessionsPerWeek)
    const tx_ref = generatePaymentRef()

    return NextResponse.json({
      amount,
      tx_ref,
      success: true
    })

  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    )
  }
}
