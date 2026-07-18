import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request } from 'express';
import { GoogleAuthController } from '../../../src/nest/google-auth/google-auth.controller';

function mockRes() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    redirectedTo: undefined as string | undefined,
    cookies: {} as Record<string, unknown>,
    cleared: [] as string[],
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
    redirect(url: string) { this.redirectedTo = url; },
    cookie(name: string, value: string) { this.cookies[name] = value; },
    clearCookie(name: string) { this.cleared.push(name); },
  };
  return res as never;
}

function mockReq(overrides: Partial<Request> = {}): Request {
  return { query: {}, cookies: {}, secure: false, ...overrides } as unknown as Request;
}

const CONFIG = { issuer: 'https://accounts.google.com', clientId: 'client-id', clientSecret: 'secret', discoveryUrl: null } as never;
const DISCOVERY_DOC = { authorization_endpoint: 'https://accounts.google.com/auth', issuer: 'https://accounts.google.com', userinfo_endpoint: 'https://x/userinfo' } as never;

function mockGoogleService(overrides: Record<string, unknown> = {}) {
  return {
    getGoogleConfig: vi.fn().mockReturnValue(CONFIG),
    getAppUrl: vi.fn().mockReturnValue('http://localhost:3001'),
    discover: vi.fn().mockResolvedValue(DISCOVERY_DOC),
    createState: vi.fn().mockReturnValue({ state: 'state-1', codeChallenge: 'challenge' }),
    consumeState: vi.fn().mockReturnValue({ redirectUri: 'http://localhost:3001/api/auth/google/callback', codeVerifier: 'verifier', inviteToken: undefined }),
    exchangeCodeForToken: vi.fn().mockResolvedValue({ _ok: true, access_token: 'access', id_token: 'idtok' }),
    verifyIdToken: vi.fn().mockResolvedValue({ ok: true, claims: { sub: 'sub-1' } }),
    getUserInfo: vi.fn().mockResolvedValue({ email: 'a@b.com', sub: 'sub-1', picture: 'http://pic' }),
    findOrCreateUser: vi.fn().mockReturnValue({ user: { id: 1 } }),
    touchLastLogin: vi.fn(),
    generateToken: vi.fn().mockReturnValue('jwt-token'),
    createAuthCode: vi.fn().mockReturnValue('auth-code'),
    consumeAuthCode: vi.fn().mockReturnValue({ token: 'jwt-token' }),
    frontendUrl: vi.fn((p: string) => `http://localhost:5173${p}`),
    setAuthCookie: vi.fn(),
    ...overrides,
  } as never;
}

describe('GoogleAuthController.login', () => {
  it('400 when Google is not configured', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ getGoogleConfig: vi.fn().mockReturnValue(null) }));
    const res = mockRes();
    await controller.login(mockReq(), res);
    expect(res.statusCode).toBe(400);
  });

  it('500 when APP_URL is not configured', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ getAppUrl: vi.fn().mockReturnValue(undefined) }));
    const res = mockRes();
    await controller.login(mockReq(), res);
    expect(res.statusCode).toBe(500);
  });

  it('redirects to the Google authorization endpoint, carrying an invite token', async () => {
    const controller = new GoogleAuthController(mockGoogleService());
    const res = mockRes();
    await controller.login(mockReq({ query: { invite: 'inv-1' } } as never), res);
    expect(res.redirectedTo).toContain('https://accounts.google.com/auth?');
    expect(res.cookies['trek_google_oidc_state']).toBe('state-1');
  });

  it('redirects without an invite token when absent', async () => {
    const controller = new GoogleAuthController(mockGoogleService());
    const res = mockRes();
    await controller.login(mockReq(), res);
    expect(res.redirectedTo).toContain('response_type=code');
  });

  it('500 when discover throws', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ discover: vi.fn().mockRejectedValue(new Error('boom')) }));
    const res = mockRes();
    await controller.login(mockReq(), res);
    expect(res.statusCode).toBe(500);
  });
});

describe('GoogleAuthController.callback', () => {
  const boundReq = () => mockReq({ cookies: { trek_google_oidc_state: 'state-1' } } as never);

  it('redirects with not_configured when Google is not configured', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ getGoogleConfig: vi.fn().mockReturnValue(null) }));
    const res = mockRes();
    await controller.callback(undefined, undefined, undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=not_configured');
  });

  it('redirects with the provider error when Google reports one', async () => {
    const controller = new GoogleAuthController(mockGoogleService());
    const res = mockRes();
    await controller.callback(undefined, undefined, 'access_denied', boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=access_denied');
  });

  it('redirects with missing_params when code or state is absent', async () => {
    const controller = new GoogleAuthController(mockGoogleService());
    const res = mockRes();
    await controller.callback(undefined, 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=missing_params');
  });

  it('redirects with invalid_state when the cookie does not match', async () => {
    const controller = new GoogleAuthController(mockGoogleService());
    const res = mockRes();
    await controller.callback('code-1', 'state-mismatch', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=invalid_state');
  });

  it('redirects with invalid_state when consumeState returns nothing', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ consumeState: vi.fn().mockReturnValue(null) }));
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=invalid_state');
  });

  it('redirects with token_failed when the token exchange is not ok', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ exchangeCodeForToken: vi.fn().mockResolvedValue({ _ok: false, _status: 400 }) }));
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=token_failed');
  });

  it('redirects with no_id_token when the token response is missing id_token', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ exchangeCodeForToken: vi.fn().mockResolvedValue({ _ok: true, access_token: 'access' }) }));
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=no_id_token');
  });

  it('redirects with id_token_invalid when verification fails', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ verifyIdToken: vi.fn().mockResolvedValue({ ok: false, error: 'bad_sig' }) }));
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=id_token_invalid');
  });

  it('redirects with no_email when userinfo has no email', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ getUserInfo: vi.fn().mockResolvedValue({ sub: 'sub-1' }) }));
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=no_email');
  });

  it('redirects with subject_mismatch when userinfo.sub disagrees with id_token.sub', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ getUserInfo: vi.fn().mockResolvedValue({ email: 'a@b.com', sub: 'other-sub' }) }));
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=subject_mismatch');
  });

  it('falls back to the id_token picture claim when userinfo has none', async () => {
    const controller = new GoogleAuthController(mockGoogleService({
      getUserInfo: vi.fn().mockResolvedValue({ email: 'a@b.com', sub: 'sub-1' }),
      verifyIdToken: vi.fn().mockResolvedValue({ ok: true, claims: { sub: 'sub-1', picture: 'http://claim-pic' } }),
    }));
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_code=auth-code');
  });

  it('redirects with the findOrCreateUser error when it fails', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ findOrCreateUser: vi.fn().mockReturnValue({ error: 'registration_disabled' }) }));
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=registration_disabled');
  });

  it('redirects with a google_code on full success', async () => {
    const controller = new GoogleAuthController(mockGoogleService());
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_code=auth-code');
  });

  it('redirects with server_error when an awaited call throws', async () => {
    const controller = new GoogleAuthController(mockGoogleService({ discover: vi.fn().mockRejectedValue(new Error('boom')) }));
    const res = mockRes();
    await controller.callback('code-1', 'state-1', undefined, boundReq(), res);
    expect(res.redirectedTo).toContain('google_error=server_error');
  });
});

describe('GoogleAuthController.exchange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('400 when code is missing', () => {
    const controller = new GoogleAuthController(mockGoogleService());
    const res = mockRes();
    controller.exchange(undefined, mockReq(), res);
    expect(res.statusCode).toBe(400);
  });

  it('400 when consumeAuthCode returns an error', () => {
    const controller = new GoogleAuthController(mockGoogleService({ consumeAuthCode: vi.fn().mockReturnValue({ error: 'expired' }) }));
    const res = mockRes();
    controller.exchange('code-1', mockReq(), res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'expired' });
  });

  it('sets the auth cookie and returns the token on success', () => {
    const controller = new GoogleAuthController(mockGoogleService());
    const res = mockRes();
    controller.exchange('code-1', mockReq(), res);
    expect(res.body).toEqual({ token: 'jwt-token' });
  });
});
