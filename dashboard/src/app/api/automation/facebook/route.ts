import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Fetch pages list from Facebook Graph API
  return NextResponse.json({
    success: true,
    platform: 'facebook',
    pages: [
      { id: 'fb-page-1', name: 'Zarss Dev Singapore', category: 'Marketing', active: true },
      { id: 'fb-page-2', name: 'Staging Restaurant Cafe', category: 'Hospitality', active: false }
    ]
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: Trigger direct Page API post dispatch
  return NextResponse.json({
    success: true,
    platform: 'facebook',
    message: 'Facebook page post stub response.',
    postId: 'fb_post_mock_9823149028',
    payloadReceived: body
  });
}
