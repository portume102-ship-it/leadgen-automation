import { NextResponse } from 'next/server'

export async function POST() {
  const triggerUrl = process.env.N8N_OUTREACH_TRIGGER_URL
  if (!triggerUrl) {
    return NextResponse.json({ error: 'N8N_OUTREACH_TRIGGER_URL not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(triggerUrl, {
      method: 'GET',
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: `n8n trigger failed: ${errorText}` }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to trigger outreach workflow'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
