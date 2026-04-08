const res = await fetch('https://stackbased.vercel.app');
const html = await res.text();
const match = html.match(/base:app_id/);
console.log('base:app_id found:', !!match);
if (match) {
  const full = html.match(/<meta[^>]*base:app_id[^>]*>/);
  console.log('Tag:', full ? full[0] : 'parse failed');
}
const manifest = html.match(/farcaster/gi);
console.log('Farcaster references:', manifest ? manifest.length : 0);
