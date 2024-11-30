import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Create a response with success status
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )

    // Remove the auth token cookie
    response.cookies.delete('auth_token')

    return response
  } catch (error) {
    console.error('[SIGN_OUT_ERROR]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
