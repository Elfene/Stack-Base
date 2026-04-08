import { Redis } from '@upstash/redis';
import * as fs from 'fs';

function loadEnv() {
  const content = fs.readFileSync('.env.local', 'utf-8');
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    process.env[t.slice(0, eq)] = t.slice(eq + 1);
  }
}
loadEnv();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const LEADERBOARD_KEY = 'leaderboard:scores';

function randomAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

async function seed() {
  const entries = [
    { score: 87, days: 1 },
    { score: 72, days: 2 },
    { score: 65, days: 1 },
    { score: 58, days: 3 },
    { score: 51, days: 2 },
    { score: 47, days: 4 },
    { score: 43, days: 1 },
    { score: 38, days: 5 },
    { score: 34, days: 3 },
    { score: 29, days: 6 },
    { score: 25, days: 2 },
    { score: 21, days: 7 },
    { score: 18, days: 4 },
    { score: 15, days: 8 },
    { score: 12, days: 5 },
  ];

  const now = Math.floor(Date.now() / 1000);

  for (const e of entries) {
    const member = JSON.stringify({
      player: randomAddress(),
      timestamp: now - e.days * 86400,
    });
    await redis.zadd(LEADERBOARD_KEY, { score: e.score, member });
  }

  console.log(`Seeded ${entries.length} leaderboard entries`);
}

seed().catch(console.error);
