import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Transaction } from "@/models/Transaction"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const transactionId = searchParams.get('transaction_id')
  const status = searchParams.get('status')

  if (status !== 'successful') {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`)
  }

  try {
    // Verify the transaction with Flutterwave
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }
    )

    const data = await response.json()

    if (data.status === 'success' && data.data.status === 'successful') {
      await connectDB()
      
      // Record the transaction
      await Transaction.create({
        transactionId: data.data.id,
        userId: data.data.meta.userId,
        amount: data.data.amount,
        currency: data.data.currency,
        status: 'completed',
        paymentMethod: data.data.payment_type,
        meta: {
          numberOfStudents: data.data.meta.numberOfStudents,
          hoursPerSession: data.data.meta.hoursPerSession,
          sessionsPerWeek: data.data.meta.sessionsPerWeek
        }
      })

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/success`)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`)
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`)
  }
}
