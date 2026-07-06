import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    platform: 'all',
    metrics: {
      followersCount: 45820,
      reachCount: 245800,
      engagementRate: 0.052,
      responseTimeSeconds: 252,
      channelsStats: [
        { channel: 'instagram', percentage: 48 },
        { channel: 'whatsapp', percentage: 32 },
        { channel: 'facebook', percentage: 14 },
        { channel: 'messenger', percentage: 6 }
      ]
    }
  });
}
