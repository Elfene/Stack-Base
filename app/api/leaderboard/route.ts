import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

const LEADERBOARD_KEY = 'leaderboard:scores';

function getRedis() {
  return new Redis({
    url: (process.env.UPSTASH_REDIS_REST_URL || '').trim(),
    token: (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim(),
  });
}

interface LeaderboardEntry {
  player: string;
  score: number;
  timestamp: number;
}

export async function GET() {
  try {
    const redis = getRedis();
    const raw = await redis.zrange(LEADERBOARD_KEY, 0, 49, { rev: true, withScores: true });

    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      const data = typeof raw[i] === 'string' ? JSON.parse(raw[i] as string) : raw[i] as { player: string; timestamp: number };
      entries.push({
        player: data.player,
        score: Number(raw[i + 1]),
        timestamp: data.timestamp,
      });
    }

    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [], error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const redis = getRedis();
    const { player, score } = await request.json();

    if (!player || typeof score !== 'number' || score <= 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const allMembers = await redis.zrange(LEADERBOARD_KEY, 0, -1, { withScores: true });
    let currentBest = 0;
    let memberToRemove: string | null = null;

    for (let i = 0; i < allMembers.length; i += 2) {
      const data = typeof allMembers[i] === 'string' ? JSON.parse(allMembers[i] as string) : allMembers[i] as { player: string };
      if (data.player?.toLowerCase() === player.toLowerCase()) {
        currentBest = Number(allMembers[i + 1]);
        memberToRemove = allMembers[i] as string;
        break;
      }
    }

    if (score <= currentBest) {
      return NextResponse.json({ success: false, message: 'Not a high score' });
    }

    if (memberToRemove) {
      await redis.zrem(LEADERBOARD_KEY, memberToRemove);
    }

    const entry = JSON.stringify({
      player,
      timestamp: Math.floor(Date.now() / 1000),
    });

    await redis.zadd(LEADERBOARD_KEY, { score, member: entry });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
