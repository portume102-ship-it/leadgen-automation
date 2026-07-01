import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const whatsappUrl = process.env.WHATSAPP_SERVICE_URL
  if (!whatsappUrl) {
    return NextResponse.json({ qr: null, error: 'WHATSAPP_SERVICE_URL not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`${whatsappUrl}/qr`, {
      headers: {
        'x-api-secret': process.env.WHATSAPP_API_SECRET || '',
      },
      next: { revalidate: 0 },
    })

    if (res.status === 404) {
      return NextResponse.json({ qr: null, message: 'Already connected or QR expired' })
    }

    if (!res.ok) {
      return NextResponse.json({ qr: null, message: 'Failed to fetch QR from service' })
    }

    const qrText = await res.text()
    // It returns raw plain text.
    return NextResponse.json({ qr: qrText || null })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'WhatsApp service unreachable'
    return NextResponse.json({
      qr: null,
      message,
    })
  }
}
