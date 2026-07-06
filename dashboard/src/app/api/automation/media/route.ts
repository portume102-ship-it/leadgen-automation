import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    assets: [
      { id: 'asset-1', name: 'mockup_singapore_cafe.png', type: 'image', sizeBytes: 2516582 },
      { id: 'asset-2', name: 'cafe_opening_promo.mp4', type: 'video', sizeBytes: 19398656 }
    ]
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    success: true,
    message: 'Media asset creation / upload configuration placeholder.',
    assetUploaded: body
  });
}
