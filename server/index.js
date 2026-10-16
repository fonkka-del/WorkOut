import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pg from 'pg';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
try { process.loadEnvFile(); } catch { /* production environments can inject variables directly */ }
const app = express();
const port = Number(process.env.PORT || 3001);
const authUrl = process.env.NEON_AUTH_URL;
const databaseUrl = process.env.NEON_DATABASE_URL;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (!authUrl || !databaseUrl) {
  throw new Error('NEON_AUTH_URL and NEON_DATABASE_URL must be configured in the server environment.');
}

const authBase = new URL(authUrl);
const jwksUrl = new URL(`${authBase.pathname.replace(/\/$/, '')}/.well-known/jwks.json`, authBase.origin);
const jwks = createRemoteJWKSet(jwksUrl);
const pool = new Pool({ connectionString: databaseUrl });
const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a minute and try again.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please wait and try again.' },
});

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
app.use(helmet({ contentSecurityPolicy: false }));
app.use('/api', apiLimiter);
app.use(express.json({ limit: '1mb' }));

// Forward auth traffic through the app origin, enforcing a shared auth rate
// limit and preserving Neon Auth's first-party session cookies.
app.use('/api/auth', (req, res, next) => {
  if (/\/(sign-in|sign-up|forget-password|request-password-reset)(\/|$)/.test(req.path)) {
    return authLimiter(req, res, next);
  }
  next();
}, async (req, res) => {
  try {
    const requestOrigin = req.get('origin');
    const appOrigin = `${req.protocol}://${req.get('host')}`;
    if (requestOrigin && requestOrigin !== appOrigin) return res.status(403).json({ error: 'Invalid request origin.' });
    const authPath = req.path.replace(/^\/(?:api\/auth|auth)(?=\/|$)/, '');
    const upstream = new URL(`${authBase.pathname.replace(/\/$/, '')}${authPath}`, authBase.origin);
    upstream.search = new URL(req.originalUrl, 'http://localhost').search;
    const headers = new Headers();
    for (const name of ['content-type', 'cookie', 'user-agent', 'origin', 'referer']) {
      const value = req.get(name);
      if (value) headers.set(name, value);
    }
    headers.set('origin', requestOrigin || appOrigin);
    const response = await fetch(upstream, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body ?? {}),
      redirect: 'manual',
    });
    for (const name of ['content-type', 'location', 'cache-control', 'set-auth-jwt']) {
      const value = response.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    const cookies = response.headers.getSetCookie?.() ?? [];
    if (cookies.length) res.setHeader('set-cookie', cookies);
    else if (response.headers.get('set-cookie')) res.setHeader('set-cookie', response.headers.get('set-cookie'));
    res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('Neon Auth proxy request failed:', error.message);
    res.status(502).json({ error: 'Authentication service is temporarily unavailable.' });
  }
});

async function requireUser(req, res, next) {
  const match = req.get('authorization')?.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Sign in to continue.' });
  try {
    const { payload } = await jwtVerify(match[1], jwks);
    if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('Missing subject');
    req.user = { id: payload.sub };
    next();
  } catch {
    res.status(401).json({ error: 'Your session expired. Please sign in again.' });
  }
}

app.get('/api/session', requireUser, (req, res) => res.json({ userId: req.user.id }));

app.get('/api/data', requireUser, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT payload FROM workout_user_data WHERE user_id = $1', [req.user.id]);
    res.json({ data: rows[0]?.payload ?? null });
  } catch (error) { next(error); }
});

app.put('/api/data', requireUser, async (req, res, next) => {
  const payload = req.body?.data;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ error: 'A valid data object is required.' });
  }
  const serialized = JSON.stringify(payload);
  if (serialized.length > 900_000) return res.status(413).json({ error: 'Your workout data is too large to save.' });
  try {
    await pool.query(
      `INSERT INTO workout_user_data (user_id, payload, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [req.user.id, serialized],
    );
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((error, _req, res, _next) => {
  console.error('API request failed:', error.message);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(root, 'dist');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const schema = await readFile(path.join(root, 'server', 'schema.sql'), 'utf8');
await pool.query(schema);
app.listen(port, () => console.log(`Workout API listening on port ${port}`));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await pool.end();
    process.exit(0);
  });
}

