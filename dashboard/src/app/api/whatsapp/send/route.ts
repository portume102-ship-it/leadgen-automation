import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const whatsappUrl = process.env.WHATSAPP_SERVICE_URL
  if (!whatsappUrl) {
    return NextResponse.json({ error: 'WHATSAPP_SERVICE_URL not configured' }, { status: 500 })
  }

  try {
    const { phone, message } = await request.json()
    if (!phone || !message) {
      return NextResponse.json({ error: 'phone and message are required' }, { status: 400 })
    }

    const res = await fetch(`${whatsappUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': process.env.WHATSAPP_API_SECRET || '',
      },
      body: JSON.stringify({ phone, message }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send WhatsApp message'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
