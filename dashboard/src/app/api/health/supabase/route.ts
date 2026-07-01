import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ connected: false, error: error.message }, { status: 200 })
    }

    return NextResponse.json({
      connected: true,
      count: count ?? 0,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Supabase connection failed'
    return NextResponse.json({
      connected: false,
      error: message,
    }, { status: 200 })
  }
}
