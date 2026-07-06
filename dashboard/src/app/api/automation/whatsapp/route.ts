import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Fetch phone numbers and WABA business profiles
  return NextResponse.json({
    success: true,
    platform: 'whatsapp',
    profiles: [
      { id: 'wa-phone-1', phoneNumber: '+65 9182 7304', verifiedName: 'Zarss Dev Singapore' }
    ]
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: Dispatch templates or standard messaging sessions via WhatsApp Cloud API
  return NextResponse.json({
    success: true,
    platform: 'whatsapp',
    message: 'WhatsApp Cloud API response stub.',
    messageId: 'wamid.HBgLMTIzNDU2Nzg5OTAZAgASGBQ1RjhD...',
    payloadReceived: body
  });
}
