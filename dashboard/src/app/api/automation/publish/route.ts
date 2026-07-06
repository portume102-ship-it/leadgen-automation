import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    scheduledPosts: [
      { id: 'post-1', title: 'Singapore Cafe Walkthrough', scheduledAt: new Date(Date.now() + 86400000).toISOString(), status: 'approved' }
    ]
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: Trigger Publishing Pipeline validations and queue post scheduling
  return NextResponse.json({
    success: true,
    message: 'Campaign scheduled post creation queue stub.',
    scheduledPostId: 'sched_post_mock_28140982',
    postData: body
  });
}
