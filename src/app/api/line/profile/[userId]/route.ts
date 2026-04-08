import { NextRequest, NextResponse } from 'next/server';

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// In-memory cache for LINE profiles (reset on server restart)
const profileCache = new Map<string, { displayName: string; pictureUrl?: string; cachedAt: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId || !userId.startsWith('U')) {
    return NextResponse.json({ displayName: userId, pictureUrl: null });
  }

  // Check cache
  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return NextResponse.json(cached);
  }

  if (!LINE_TOKEN) {
    return NextResponse.json({ displayName: userId, pictureUrl: null });
  }

  try {
    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { Authorization: `Bearer ${LINE_TOKEN}` },
    });

    if (!response.ok) {
      return NextResponse.json({ displayName: userId, pictureUrl: null });
    }

    const profile = await response.json();
    const result = {
      displayName: profile.displayName || userId,
      pictureUrl: profile.pictureUrl || null,
      cachedAt: Date.now(),
    };

    profileCache.set(userId, result);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ displayName: userId, pictureUrl: null });
  }
}
