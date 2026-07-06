import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  // Delete the session cookie to log the user out
  response.cookies.delete('zarss_session')
  return response
}
