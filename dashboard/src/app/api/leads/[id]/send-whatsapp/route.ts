import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const whatsappUrl = process.env.WHATSAPP_SERVICE_URL
  if (!whatsappUrl) {
    return NextResponse.json({ error: 'WHATSAPP_SERVICE_URL not configured' }, { status: 500 })
  }

  try {
    // 1. Get lead from Supabase
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !lead) {
      return NextResponse.json({ error: fetchError?.message || 'Lead not found' }, { status: 404 })
    }

    // 2. Validate phone
    if (!lead.phone) {
      return NextResponse.json({ error: 'Lead phone number is missing' }, { status: 400 })
    }

    // 3. Validate AI message
    if (!lead.ai_message_whatsapp) {
      return NextResponse.json({ error: 'WhatsApp AI message is empty or not generated yet' }, { status: 400 })
    }

    // 4. Call WhatsApp service
    const res = await fetch(`${whatsappUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': process.env.WHATSAPP_API_SECRET || '',
      },
      body: JSON.stringify({
        phone: lead.phone,
        message: lead.ai_message_whatsapp,
      }),
    })

    const result = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: result.error || 'Failed to send via WhatsApp microservice' }, { status: res.status })
    }

    // 5. Update lead in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        status: 'whatsapp_sent',
        whatsapp_sent_at: new Date().toISOString(),
        last_contacted_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: `WhatsApp sent but database update failed: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, chatId: result.chatId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
