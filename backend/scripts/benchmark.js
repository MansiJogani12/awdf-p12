// Measures GET /tasks response times against a running server.
// Usage: npm run benchmark            (server started normally — cache on)
//        set CACHE_ENABLED=false in .env, restart the server, run again (cache off)
// Options via env: API_URL (default http://localhost:5000), SEED (tasks to create, default 2000)

const API = process.env.API_URL || 'http://localhost:5000';
const SEED = Number(process.env.SEED) || 2000;
const READINGS = 5;

const json = (method, path, body, token) =>
  fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });

async function main() {
  // Dedicated benchmark user so measurements don't touch real data
  const credentials = { email: 'benchmark@example.com', password: 'benchmark123' };
  await json('POST', '/auth/register', credentials); // 409 if it already exists — that's fine
  const { token } = await (await json('POST', '/auth/login', credentials)).json();

  // Seed enough tasks for the database read to be noticeable
  const existing = await (await json('GET', '/tasks', null, token)).json();
  for (let i = existing.length; i < SEED; i += 100) {
    await Promise.all(
      Array.from({ length: Math.min(100, SEED - i) }, (_, j) =>
        json('POST', '/tasks', { title: `Benchmark task ${i + j + 1}`, description: 'x'.repeat(200) }, token)
      )
    );
  }

  console.log(`GET /tasks with ${SEED} tasks — ${READINGS} readings\n`);
  for (let n = 1; n <= READINGS; n++) {
    const start = performance.now();
    const res = await json('GET', '/tasks', null, token);
    await res.arrayBuffer();
    const ms = (performance.now() - start).toFixed(1);
    console.log(`  #${n}  ${ms.padStart(7)} ms   X-Cache: ${res.headers.get('x-cache')}`);
  }
}

main().catch((err) => {
  console.error('Benchmark failed:', err.message);
  process.exit(1);
});
