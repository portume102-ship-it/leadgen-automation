import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hubMode = searchParams.get('hub.mode');
  const hubVerifyToken = searchParams.get('hub.verify_token');
  const hubChallenge = searchParams.get('hub.challenge');

  // TODO: Validate Verify Token against environment config
  if (hubMode === 'subscribe' && hubVerifyToken) {
    return new Response(hubChallenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const signature = req.headers.get('x-hub-signature-256') || '';

  // TODO: Validate Webhook Signature using app secret
  // TODO: Extract event type, normalize payload, and dispatch to n8n Master Orchestrator
  return NextResponse.json({
    success: true,
    message: 'Webhook payload received and dispatched.',
    signatureMatched: !!signature,
    payloadType: body.object || 'unknown'
  });
}
