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
    // Accept both old and new payloads
    let amount = 0
    if (Array.isArray(body.subjects)) {
      // New: array of subject configs
      amount = body.subjects.reduce(
        (sum, s) =>
          sum +
          calculateTutorialCost(
            5,
            s.numberOfStudents,
            s.hoursPerSession,
            s.sessionsPerWeek
          ),
        0
      )
    } else if (
      typeof body.numberOfStudents === "number" &&
      typeof body.hoursPerSession === "number" &&
      typeof body.sessionsPerWeek === "number"
    ) {
      // Old: single subject config
      amount = calculateTutorialCost(
        5,
        body.numberOfStudents,
        body.hoursPerSession,
        body.sessionsPerWeek
      )
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

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
