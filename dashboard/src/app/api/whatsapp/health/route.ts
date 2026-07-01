import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const whatsappUrl = process.env.WHATSAPP_SERVICE_URL
  if (!whatsappUrl) {
    return NextResponse.json({ ready: false, error: 'WHATSAPP_SERVICE_URL not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`${whatsappUrl}/health`, {
      headers: {
        'x-api-secret': process.env.WHATSAPP_API_SECRET || '',
      },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return NextResponse.json({ ready: false, status: res.status }, { status: 200 })
    }

    const data = await res.json()
    return NextResponse.json({
      ready: !!data.whatsapp_ready,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'WhatsApp service unreachable'
    return NextResponse.json({
      ready: false,
      error: message,
      timestamp: new Date().toISOString(),
    }, { status: 200 })
  }
}
