import crypto, { createHmac } from 'crypto';

// Paddle Billing's real webhook signature format (not a simplified stand-in —
// this is a drop-in once a real PADDLE_WEBHOOK_SECRET exists):
//   header: `Paddle-Signature: ts=<unix_seconds>;h1=<hex_hmac_sha256>`
//   signed payload: `${ts}:${rawRequestBody}`, HMAC-SHA256 keyed by the webhook secret.
const SIGNATURE_HEADER_RE = /^ts=(\d+);h1=([0-9a-f]+)$/;

// 5-minute replay window. This is a reasonable addition beyond what Paddle
// itself requires — Paddle only mandates verifying the HMAC, not a timestamp
// bound — but rejecting stale/replayed signatures is good webhook hygiene.
const MAX_SIGNATURE_AGE_SECONDS = 300;

/** Constant-time comparison of two hex-encoded strings (mirrors oauthService.ts's timingSafeEqualHex). */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export function verifyPaddleSignature(rawBody: Buffer, header: string | undefined, secret: string): boolean {
  if (!header) return false;
  const match = SIGNATURE_HEADER_RE.exec(header);
  if (!match) return false;

  const [, ts, h1] = match;
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(ts));
  if (ageSeconds > MAX_SIGNATURE_AGE_SECONDS) return false;

  const signedPayload = `${ts}:${rawBody.toString('utf8')}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');
  return timingSafeEqualHex(expected, h1);
}
