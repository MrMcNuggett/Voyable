// Sends a correctly-signed Paddle webhook fixture to a running dev server, so
// the webhook endpoint can be exercised locally without a real Paddle account.
//
// Usage: node scripts/paddle-webhook-test.mjs <fixture-name> [userId] [baseUrl]
//   fixture-name: subscription-created | subscription-updated | subscription-canceled | transaction-completed
//   userId:       numeric id to substitute for the fixture's __TEST_USER_ID__ placeholder (default: 1)
//   baseUrl:      default http://localhost:3001
//
// Equivalent manual curl (once you have BODY/TS/SIG computed the same way):
//   BODY='...' ; TS=$(date +%s) ; SECRET=dummy_secret
//   SIG=$(node -e "console.log(require('crypto').createHmac('sha256',process.env.SECRET).update(process.env.TS+':'+process.env.BODY).digest('hex'))")
//   curl -X POST http://localhost:3001/api/webhooks/paddle -H "Content-Type: application/json" -H "Paddle-Signature: ts=$TS;h1=$SIG" -d "$BODY"

import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [, , fixtureName, userIdArg, baseUrlArg] = process.argv;

if (!fixtureName) {
  console.error('Usage: node scripts/paddle-webhook-test.mjs <fixture-name> [userId] [baseUrl]');
  console.error('Available fixtures: subscription-created, subscription-updated, subscription-canceled, transaction-completed');
  process.exit(1);
}

const secret = process.env.PADDLE_WEBHOOK_SECRET || 'dummy_secret';
const userId = userIdArg || '1';
const baseUrl = baseUrlArg || 'http://localhost:3001';

const fixturePath = path.join(__dirname, '../tests/fixtures/paddle', `${fixtureName}.json`);
const rawFixture = readFileSync(fixturePath, 'utf8');
const body = rawFixture.replaceAll('__TEST_USER_ID__', userId);

const ts = Math.floor(Date.now() / 1000);
const h1 = createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex');

const url = `${baseUrl}/api/webhooks/paddle`;

console.log(`POST ${url}`);
console.log(`Paddle-Signature: ts=${ts};h1=${h1}`);

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Paddle-Signature': `ts=${ts};h1=${h1}`,
  },
  body,
});

const responseBody = await res.text();
console.log(`Status: ${res.status}`);
console.log(`Body: ${responseBody}`);
