import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Fetch conversation list from Messenger Platform
  return NextResponse.json({
    success: true,
    platform: 'messenger',
    conversations: [
      { id: 'msg-conv-1', participant: 'User 984210', lastMessage: 'Is this redesign free or paid?' }
    ]
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: Send DM reply via Send API
  return NextResponse.json({
    success: true,
    platform: 'messenger',
    message: 'Messenger Send API response stub.',
    messageId: 'mid.mock_message_921048',
    payloadReceived: body
  });
}
