import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/services/wikiService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../src/services/wikiService')>();
  return {
    ...actual,
    getWikiIndex: vi.fn(),
    getWikiPage: vi.fn(),
    getWikiAsset: vi.fn(),
  };
});

import { HelpController } from '../../../src/nest/help/help.controller';
import { getWikiIndex, getWikiPage, getWikiAsset, WikiNotFound } from '../../../src/services/wikiService';

function mockRes() {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    ended: false,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
    setHeader(name: string, value: string) { this.headers[name] = value; },
    end(buf?: unknown) { this.ended = true; this.body = buf; },
  };
  return res as never;
}

describe('HelpController', () => {
  const controller = new HelpController();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('index() delegates to getWikiIndex', async () => {
    vi.mocked(getWikiIndex).mockResolvedValueOnce({ sections: [] });
    await expect(controller.index()).resolves.toEqual({ sections: [] });
  });

  it('page() returns the page json on success', async () => {
    vi.mocked(getWikiPage).mockResolvedValueOnce({ title: 'Intro', html: '<p>hi</p>' } as never);
    const res = mockRes();
    await controller.page('intro', res);
    expect(res.statusCode).toBe(0); // res.json() never sets a status explicitly for the 200 path
    expect(res.body).toEqual({ title: 'Intro', html: '<p>hi</p>' });
  });

  it('page() returns 404 for WikiNotFound', async () => {
    vi.mocked(getWikiPage).mockRejectedValueOnce(new WikiNotFound('missing'));
    const res = mockRes();
    await controller.page('missing', res);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Help page unavailable' });
  });

  it('page() returns 502 for any other error', async () => {
    vi.mocked(getWikiPage).mockRejectedValueOnce(new Error('upstream down'));
    const res = mockRes();
    await controller.page('intro', res);
    expect(res.statusCode).toBe(502);
  });

  it('asset() streams the buffer on success', async () => {
    vi.mocked(getWikiAsset).mockResolvedValueOnce({ buf: Buffer.from('img'), type: 'image/png' });
    const req = { originalUrl: '/api/help/asset/logo.png' } as never;
    const res = mockRes();
    await controller.asset(req, res);
    expect(res.headers['Content-Type']).toBe('image/png');
    expect(res.ended).toBe(true);
  });

  it('asset() returns 404 when the asset lookup fails', async () => {
    vi.mocked(getWikiAsset).mockRejectedValueOnce(new Error('not found'));
    const req = { originalUrl: '/api/help/asset/missing.png' } as never;
    const res = mockRes();
    await controller.asset(req, res);
    expect(res.statusCode).toBe(404);
  });

  it('asset() falls back to req.url when originalUrl is absent', async () => {
    vi.mocked(getWikiAsset).mockResolvedValueOnce({ buf: Buffer.from('img'), type: 'image/png' });
    const req = { originalUrl: undefined, url: '/api/help/asset/logo.png?x=1' } as never;
    const res = mockRes();
    await controller.asset(req, res);
    expect(vi.mocked(getWikiAsset)).toHaveBeenCalledWith('logo.png');
  });
});
