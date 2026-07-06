import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const expected = process.env.DASHBOARD_PASSWORD || 'wrongpassword'

    if (password === expected) {
      const response = NextResponse.json({ success: true })
      // Set the HTTP-only session cookie
      response.cookies.set('zarss_session', 'true', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', message: err.message }, { status: 500 })
  }
}
