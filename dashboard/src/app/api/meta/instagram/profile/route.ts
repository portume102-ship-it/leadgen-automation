import { NextRequest, NextResponse } from 'next/server'

const GRAPH_BASE = 'https://graph.facebook.com'
const API_VERSION = process.env.META_GRAPH_API_VERSION || 'v23.0'

function getPageToken() {
  return process.env.META_PAGE_ACCESS_TOKEN || ''
}
function getIgBizId() {
  return process.env.INSTAGRAM_BUSINESS_ID || ''
}

// GET /api/meta/instagram/profile
export async function GET(req: NextRequest) {
  const pageToken = getPageToken()
  const igBizId = getIgBizId()
  const action = req.nextUrl.searchParams.get('action') || 'profile'

  if (!pageToken || !igBizId) {
    return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ID required.' }, { status: 400 })
  }

  try {
    let url = ''
    switch (action) {
      case 'profile':
        url = `${GRAPH_BASE}/${API_VERSION}/${igBizId}?fields=id,name,username,biography,followers_count,follows_count,media_count,profile_picture_url,website&access_token=${pageToken}`
        break
      case 'media':
        url = `${GRAPH_BASE}/${API_VERSION}/${igBizId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=20&access_token=${pageToken}`
        break
      case 'insights':
        url = `${GRAPH_BASE}/${API_VERSION}/${igBizId}/insights?metric=impressions,reach,follower_count&period=day&access_token=${pageToken}`
        break
      case 'comments': {
        const mediaId = req.nextUrl.searchParams.get('media_id') || ''
        if (!mediaId) return NextResponse.json({ error: 'media_id required' }, { status: 400 })
        url = `${GRAPH_BASE}/${API_VERSION}/${mediaId}/comments?fields=id,text,from,timestamp&access_token=${pageToken}`
        break
      }
      case 'messages':
        // IG conversation list
        url = `${GRAPH_BASE}/${API_VERSION}/me/conversations?fields=id,participants,messages{message,from,created_time}&platform=instagram&access_token=${pageToken}`
        break
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

// POST /api/meta/instagram/profile — Publish post, reel, carousel, reply to comment
export async function POST(req: NextRequest) {
  const pageToken = getPageToken()
  const igBizId = getIgBizId()
  const action = req.nextUrl.searchParams.get('action') || 'post'

  if (!pageToken || !igBizId) {
    return NextResponse.json({ error: 'META_PAGE_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ID required.' }, { status: 400 })
  }

  try {
    const body = await req.json()

    switch (action) {
      case 'post': {
        // Step 1: create media container
        const containerRes = await fetch(`${GRAPH_BASE}/${API_VERSION}/${igBizId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: body.image_url,
            caption: body.caption || '',
            access_token: pageToken,
          }),
        })
        const container = await containerRes.json()
        if (container.error) return NextResponse.json({ success: false, data: container })

        // Step 2: publish container
        const publishRes = await fetch(`${GRAPH_BASE}/${API_VERSION}/${igBizId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: container.id, access_token: pageToken }),
        })
        const publish = await publishRes.json()
        return NextResponse.json({ success: !publish.error, data: { container, publish } })
      }

      case 'reel': {
        const containerRes = await fetch(`${GRAPH_BASE}/${API_VERSION}/${igBizId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video_url: body.video_url,
            caption: body.caption || '',
            media_type: 'REELS',
            access_token: pageToken,
          }),
        })
        const container = await containerRes.json()
        if (container.error) return NextResponse.json({ success: false, data: container })

        const publishRes = await fetch(`${GRAPH_BASE}/${API_VERSION}/${igBizId}/media_publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: container.id, access_token: pageToken }),
        })
        const publish = await publishRes.json()
        return NextResponse.json({ success: !publish.error, data: { container, publish } })
      }

      case 'reply_comment': {
        const res = await fetch(`${GRAPH_BASE}/${API_VERSION}/${body.comment_id}/replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: body.message, access_token: pageToken }),
        })
        const data = await res.json()
        return NextResponse.json({ success: !data.error, data })
      }

      case 'delete_media': {
        const res = await fetch(`${GRAPH_BASE}/${API_VERSION}/${body.media_id}?access_token=${pageToken}`, { method: 'DELETE' })
        const data = await res.json()
        return NextResponse.json({ success: !data.error, data })
      }

      case 'reply_dm': {
        // Reply to IG DM
        const res = await fetch(`${GRAPH_BASE}/${API_VERSION}/me/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: body.recipient_id },
            message: { text: body.message },
            access_token: pageToken,
          }),
        })
        const data = await res.json()
        return NextResponse.json({ success: !data.error, data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
