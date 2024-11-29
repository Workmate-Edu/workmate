import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Create a response with success status
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )

    // Remove the auth token cookie with all necessary options
    response.cookies.delete('auth_token', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 0 // Force immediate expiration
    })

    return response
  } catch (error) {
    console.error('[Sign-out Error]:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}
