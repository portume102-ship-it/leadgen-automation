import { NextRequest, NextResponse } from 'next/server'

const GRAPH_BASE = 'https://graph.facebook.com'
const API_VERSION = process.env.META_GRAPH_API_VERSION || 'v23.0'

function getPageToken() {
  return process.env.META_PAGE_ACCESS_TOKEN || ''
}
function getPageId() {
  return process.env.META_PAGE_ID || ''
}

// GET /api/meta/facebook/page — Fetch page info
export async function GET(req: NextRequest) {
  const pageToken = getPageToken()
  const pageId = getPageId()
  const action = req.nextUrl.searchParams.get('action') || 'info'

  if (!pageToken || !pageId) {
    return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN and META_PAGE_ID not configured.' }, { status: 400 })
  }

  try {
    let url = ''
    switch (action) {
      case 'info':
        url = `${GRAPH_BASE}/${API_VERSION}/${pageId}?fields=id,name,fan_count,link,category,about,website,phone,picture&access_token=${pageToken}`
        break
      case 'posts':
        url = `${GRAPH_BASE}/${API_VERSION}/${pageId}/posts?fields=id,message,created_time,permalink_url,attachments&limit=20&access_token=${pageToken}`
        break
      case 'insights':
        url = `${GRAPH_BASE}/${API_VERSION}/${pageId}/insights?metric=page_impressions,page_engagements,page_fans&period=day&access_token=${pageToken}`
        break
      case 'comments': {
        const postId = req.nextUrl.searchParams.get('post_id') || ''
        if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 })
        url = `${GRAPH_BASE}/${API_VERSION}/${postId}/comments?fields=id,message,from,created_time&access_token=${pageToken}`
        break
      }
      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }

    const res = await fetch(url)
    const data = await res.json()
    return NextResponse.json({ success: !data.error, data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

// POST /api/meta/facebook/page — Publish / comment / reply actions
export async function POST(req: NextRequest) {
  const pageToken = getPageToken()
  const pageId = getPageId()
  const action = req.nextUrl.searchParams.get('action') || 'post'

  if (!pageToken || !pageId) {
    return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN and META_PAGE_ID not configured.' }, { status: 400 })
  }

  try {
    const body = await req.json()
    let url = ''
    let payload: Record<string, unknown> = {}

    switch (action) {
      case 'post':
        url = `${GRAPH_BASE}/${API_VERSION}/${pageId}/feed`
        payload = { message: body.message, link: body.link, access_token: pageToken }
        break
      case 'delete': {
        const postId = body.post_id
        if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 })
        const res = await fetch(`${GRAPH_BASE}/${API_VERSION}/${postId}?access_token=${pageToken}`, { method: 'DELETE' })
        const data = await res.json()
        return NextResponse.json({ success: !data.error, data })
      }
      case 'reply_comment':
        url = `${GRAPH_BASE}/${API_VERSION}/${body.comment_id}/comments`
        payload = { message: body.message, access_token: pageToken }
        break
      case 'like_comment':
        url = `${GRAPH_BASE}/${API_VERSION}/${body.comment_id}/likes`
        payload = { access_token: pageToken }
        break
      case 'hide_comment':
        url = `${GRAPH_BASE}/${API_VERSION}/${body.comment_id}`
        payload = { is_hidden: true, access_token: pageToken }
        break
      case 'delete_comment': {
        const res = await fetch(`${GRAPH_BASE}/${API_VERSION}/${body.comment_id}?access_token=${pageToken}`, { method: 'DELETE' })
        const data = await res.json()
        return NextResponse.json({ success: !data.error, data })
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    return NextResponse.json({ success: !data.error, data })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
