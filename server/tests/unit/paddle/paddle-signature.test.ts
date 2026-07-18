import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { verifyPaddleSignature } from '../../../src/nest/paddle/paddle-signature';

const SECRET = 'dummy_secret';

function sign(body: string, ts: number, secret: string = SECRET): string {
  const h1 = createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex');
  return `ts=${ts};h1=${h1}`;
}

describe('verifyPaddleSignature', () => {
  const body = Buffer.from('{"event_id":"evt_1"}');

  it('accepts a correctly signed, fresh payload', () => {
    const ts = Math.floor(Date.now() / 1000);
    expect(verifyPaddleSignature(body, sign(body.toString('utf8'), ts), SECRET)).toBe(true);
  });

  it('rejects a missing header', () => {
    expect(verifyPaddleSignature(body, undefined, SECRET)).toBe(false);
  });

  it('rejects a malformed header', () => {
    expect(verifyPaddleSignature(body, 'not-a-valid-header', SECRET)).toBe(false);
    expect(verifyPaddleSignature(body, 'ts=abc;h1=xyz', SECRET)).toBe(false);
  });

  it('rejects a signature signed with the wrong secret', () => {
    const ts = Math.floor(Date.now() / 1000);
    expect(verifyPaddleSignature(body, sign(body.toString('utf8'), ts, 'wrong_secret'), SECRET)).toBe(false);
  });

  it('rejects a stale timestamp outside the replay window', () => {
    const staleTs = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    expect(verifyPaddleSignature(body, sign(body.toString('utf8'), staleTs), SECRET)).toBe(false);
  });

  it('rejects a signature computed over a different body (tamper detection)', () => {
    const ts = Math.floor(Date.now() / 1000);
    const sig = sign('{"event_id":"evt_1"}', ts);
    const tamperedBody = Buffer.from('{"event_id":"evt_2"}');
    expect(verifyPaddleSignature(tamperedBody, sig, SECRET)).toBe(false);
  });
});
