import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch only the columns we need to aggregate in memory
    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select('status, city, category, created_at')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalCount = leads?.length ?? 0
    const statusCounts: Record<string, number> = {
      new: 0,
      whatsapp_sent: 0,
      email_sent: 0,
      replied: 0,
      converted: 0,
      skip: 0,
    }

    const cityMap = new Map<string, number>()
    const categoryMap = new Map<string, number>()
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    let addedLast7Days = 0

    for (const lead of (leads || [])) {
      // 1. Status counts
      if (lead.status && lead.status in statusCounts) {
        statusCounts[lead.status]++
      }

      // 2. Added last 7 days
      if (lead.created_at) {
        const createdAtDate = new Date(lead.created_at)
        if (createdAtDate >= sevenDaysAgo) {
          addedLast7Days++
        }
      }

      // 3. Top cities
      if (lead.city) {
        const cleanedCity = lead.city.trim()
        cityMap.set(cleanedCity, (cityMap.get(cleanedCity) ?? 0) + 1)
      }

      // 4. Top categories
      if (lead.category) {
        const cleanedCategory = lead.category.trim()
        categoryMap.set(cleanedCategory, (categoryMap.get(cleanedCategory) ?? 0) + 1)
      }
    }

    // Sort and slice top 5 cities
    const topCities = Array.from(cityMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Sort and slice top 5 categories
    const topCategories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({
      total: totalCount,
      statusCounts,
      addedLast7Days,
      topCities,
      topCategories,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
