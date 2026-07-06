import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Integrate Facebook/Instagram OAuth token exchange
  return NextResponse.json({
    success: true,
    message: 'OAuth authorization URL skeleton response.',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth?client_id=MOCK_CLIENT_ID&redirect_uri=MOCK_REDIRECT_URI'
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: Validate callback code and issue Access Tokens
  return NextResponse.json({
    success: true,
    message: 'OAuth token exchange skeleton response.',
    connectedAccount: {
      id: 'mock-auth-acc-123',
      platform: body.platform || 'facebook',
      name: 'Mock Auth Page',
      status: 'connected',
      connectedAt: new Date().toISOString()
    }
  });
}
