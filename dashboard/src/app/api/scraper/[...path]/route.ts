import { NextRequest, NextResponse } from 'next/server'
 
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const whatsappUrl = process.env.V3_BACKEND_URL || process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001'
  const subPath = params.path.join('/')
  
  // Map /api/scraper/... to backend /api/jobs/...
  const backendPath = subPath === 'jobs' ? '/api/jobs' : `/api/jobs/${subPath}`
  const targetUrl = `${whatsappUrl.replace(/\/$/, '')}${backendPath}`
 
  try {
    const body = await req.json().catch(() => ({}))
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': process.env.WHATSAPP_API_SECRET || '',
      },
      body: JSON.stringify(body)
    })
 
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Proxy connection failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
 
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const whatsappUrl = process.env.V3_BACKEND_URL || process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001'
  const subPath = params.path.join('/')
  
  // Map /api/scraper/... to backend /api/jobs/...
  const backendPath = subPath === 'jobs' ? '/api/jobs' : `/api/jobs/${subPath}`
  const targetUrl = `${whatsappUrl.replace(/\/$/, '')}${backendPath}`
 
  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'x-api-secret': process.env.WHATSAPP_API_SECRET || '',
      },
    })
 
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Proxy connection failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
