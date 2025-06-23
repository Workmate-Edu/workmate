import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { connectDB } from "@/lib/mongodb"
import { Transaction } from '@/models/Transaction'

export async function POST(req: Request) {
  try {
    const headersList = headers()
    const signature = headersList.get('verif-hash')
    
    // Verify Flutterwave webhook signature
    if (!signature || signature !== process.env.FLW_WEBHOOK_HASH) {
      console.error('Invalid webhook signature')
      return new NextResponse('Invalid signature', { status: 400 })
    }

    await connectDB()
    const event = await req.json()

    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      // Create transaction record
      const transaction = await Transaction.create({
        transactionId: event.data.id,
        userId: event.data.meta.userId,
        amount: event.data.amount,
        currency: event.data.currency,
        status: 'completed',
        paymentMethod: event.data.payment_type,
        meta: {
          customerEmail: event.data.customer.email,
          flwRef: event.data.flw_ref,
          txRef: event.data.tx_ref
        }
      })

      console.log('Transaction recorded:', transaction._id)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Handle other event types if needed
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    )
  }
}
