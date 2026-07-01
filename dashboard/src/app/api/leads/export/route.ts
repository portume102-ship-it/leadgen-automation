import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const city = searchParams.get('city')
    const category = searchParams.get('category')

    let query = supabaseAdmin.from('leads').select('*')

    if (status) {
      query = query.eq('status', status)
    }
    if (city) {
      query = query.ilike('city', `%${city}%`)
    }
    if (category) {
      query = query.eq('category', category)
    }

    // Sort by created_at desc
    query = query.order('created_at', { ascending: false })

    const { data: leads, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Convert leads to CSV format
    const headers = [
      'id', 'created_at', 'name', 'phone', 'email', 'address', 'city',
      'category', 'website', 'rating', 'review_count', 'source', 'status',
      'whatsapp_sent_at', 'email_sent_at', 'last_contacted_at'
    ]

    const csvRows = [headers.join(',')]

    for (const lead of (leads || [])) {
      const values = headers.map(header => {
        const val = lead[header]
        if (val === null || val === undefined) {
          return '""'
        }
        // Escape quotes and wrap in quotes
        const strVal = String(val).replace(/"/g, '""')
        return `"${strVal}"`
      })
      csvRows.push(values.join(','))
    }

    const csvContent = csvRows.join('\n')
    const dateStr = new Date().toISOString().split('T')[0]

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-export-${dateStr}.csv"`,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'CSV export failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
