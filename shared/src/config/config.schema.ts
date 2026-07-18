import { z } from 'zod';

/**
 * Public config contract — the unauthenticated /api/config endpoint.
 *
 * This is the only public (non-authenticated) endpoint in the L2 bundle: the
 * login page reads it before a user signs in to pick the initial language. The
 * legacy route (server/src/routes/publicConfig.ts) returns just the server's
 * configured default language, so the response is intentionally minimal.
 */
export const publicConfigSchema = z.object({
  defaultLanguage: z.string(),
  // Paddle overlay-checkout needs a client-side token; safe to expose publicly
  // (it's not a secret — the webhook secret/API key stay server-only).
  paddleClientToken: z.string().nullable(),
  paddleEnvironment: z.enum(['sandbox', 'production']),
});
export type PublicConfig = z.infer<typeof publicConfigSchema>;
