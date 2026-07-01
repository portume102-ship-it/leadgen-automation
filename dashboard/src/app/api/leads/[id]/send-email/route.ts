import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
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

    // 2. Validate email and AI copy
    if (!lead.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 })
    }
    if (!lead.ai_message_email_subject || !lead.ai_message_email_body) {
      return NextResponse.json({ error: 'Email subject or body is empty or not generated yet' }, { status: 400 })
    }

    // 3. Send email via Resend API
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [lead.email],
        subject: lead.ai_message_email_subject,
        text: lead.ai_message_email_body,
      }),
    })

    const result = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: result.message || 'Resend API error' }, { status: res.status })
    }

    // 4. Update status in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        status: 'email_sent',
        email_sent_at: new Date().toISOString(),
        last_contacted_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: `Email sent but database update failed: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
