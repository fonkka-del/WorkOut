import { createAuthClient } from '@neondatabase/auth';

// Auth requests use the same origin as the app so the API can apply rate limits
// and keep the Neon session cookie first-party.
export const authClient = createAuthClient(`${window.location.origin}/api/auth`);

