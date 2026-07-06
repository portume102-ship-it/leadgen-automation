import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    accounts: [
      { id: 'acc-1', name: 'Zarss Dev Singapore', platform: 'facebook', status: 'connected' },
      { id: 'acc-2', name: 'Staging Restaurant Cafe', platform: 'facebook', status: 'needs_reauth' },
      { id: 'acc-3', name: '@zarss_dev', platform: 'instagram', status: 'connected' },
      { id: 'acc-4', name: 'Zarss Dev Inbox Chat', platform: 'messenger', status: 'connected' }
    ]
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    success: true,
    message: 'Accounts settings modification trigger stub.',
    action: body.action || 'connect'
  });
}
