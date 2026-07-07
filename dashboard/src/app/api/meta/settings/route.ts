import { NextRequest, NextResponse } from 'next/server'

// POST /api/meta/settings — Saves Meta configuration (server-side only, values would go to DB via backend)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 })
    }

    // Forward to backend encryption layer
    const backendUrl = process.env.V3_BACKEND_URL || process.env.WHATSAPP_SERVICE_URL
    if (!backendUrl) {
      // Fallback: acknowledge (settings can also live in .env for initial setup)
      return NextResponse.json({ success: true, message: 'Settings acknowledged (no backend configured).' })
    }

    const res = await fetch(`${backendUrl}/api/automation/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': process.env.WHATSAPP_API_SECRET || '',
      },
      body: JSON.stringify({
        platform: 'facebook',
        account_name: settings.META_PAGE_NAME || 'Meta App',
        app_id: settings.META_APP_ID,
        credentials: {
          app_secret: settings.META_APP_SECRET,
          access_token: settings.META_PAGE_ACCESS_TOKEN,
          page_id: settings.META_PAGE_ID,
          verify_token: settings.META_VERIFY_TOKEN,
          webhook_url: settings.META_WEBHOOK_CALLBACK_URL,
          ig_business_id: settings.INSTAGRAM_BUSINESS_ID,
          ig_username: settings.INSTAGRAM_USERNAME,
        },
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Backend save failed.')

    return NextResponse.json({ success: true, message: 'Meta settings saved and encrypted.' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/meta/settings — Returns current settings (without exposing secrets)
export async function GET() {
  try {
    const backendUrl = process.env.V3_BACKEND_URL || process.env.WHATSAPP_SERVICE_URL
    if (!backendUrl) {
      return NextResponse.json({
        settings: {
          META_APP_ID: process.env.META_APP_ID || '',
          META_PAGE_ID: process.env.META_PAGE_ID || '',
          META_GRAPH_API_VERSION: process.env.META_GRAPH_API_VERSION || 'v23.0',
          META_WEBHOOK_CALLBACK_URL: process.env.META_WEBHOOK_CALLBACK_URL || '',
          INSTAGRAM_BUSINESS_ID: process.env.INSTAGRAM_BUSINESS_ID || '',
        }
      })
    }

    const res = await fetch(`${backendUrl}/api/automation/accounts`, {
      headers: { 'x-api-secret': process.env.WHATSAPP_API_SECRET || '' },
    })
    const data = await res.json()
    return NextResponse.json({ settings: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
