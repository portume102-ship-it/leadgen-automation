import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Fetch instagram business profile metadata
  return NextResponse.json({
    success: true,
    platform: 'instagram',
    profiles: [
      { id: 'ig-acc-1', username: 'zarss_dev', followersCount: 14209 }
    ]
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: Publish visual media post / carousel / Reel to Instagram Container
  return NextResponse.json({
    success: true,
    platform: 'instagram',
    message: 'Instagram media post stub response.',
    mediaContainerId: 'ig_container_mock_829412',
    postId: 'ig_post_mock_3921849204',
    payloadReceived: body
  });
}
