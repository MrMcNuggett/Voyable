import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GoogleAuthService } from './google-auth.service';
import { cookieOptions } from '../../services/cookie';

const GOOGLE_STATE_COOKIE = 'trek_google_oidc_state';

/**
 * /api/auth/google — Google OIDC login flow (Authorization Code + PKCE).
 *
 * Mirrors the generic OIDC flow (server/src/nest/oidc/oidc.controller.ts)
 * exactly, but against a fixed Google config and its own state cookie so a
 * concurrent generic-OIDC login attempt in another tab can't clobber this
 * one (and vice versa).
 */
@Controller('api/auth/google')
export class GoogleAuthController {
  constructor(private readonly google: GoogleAuthService) {}

  @Get('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    const config = this.google.getGoogleConfig();
    if (!config) {
      res.status(400).json({ error: 'Google login not configured' });
      return;
    }
    try {
      const doc = await this.google.discover(config.issuer, config.discoveryUrl);
      const appUrl = this.google.getAppUrl();
      if (!appUrl) {
        res.status(500).json({ error: 'APP_URL is not configured. Google login cannot be used.' });
        return;
      }
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl.replace(/\/+$/, '')}/api/auth/google/callback`;
      const inviteToken = req.query.invite as string | undefined;
      const { state, codeChallenge } = this.google.createState(redirectUri, inviteToken);
      res.cookie(GOOGLE_STATE_COOKIE, state, { ...cookieOptions(false, req), maxAge: 10 * 60 * 1000 });
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: redirectUri,
        scope: 'openid email profile',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });
      res.redirect(`${doc.authorization_endpoint}?${params}`);
    } catch (err: unknown) {
      console.error('[Google Auth] Login error:', err instanceof Error ? err.message : err);
      res.status(500).json({ error: 'Google login failed' });
    }
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') googleError: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const f = (p: string) => res.redirect(this.google.frontendUrl(p));

    const boundState = (req.cookies as Record<string, string> | undefined)?.[GOOGLE_STATE_COOKIE];
    res.clearCookie(GOOGLE_STATE_COOKIE, cookieOptions(true, req));

    const config = this.google.getGoogleConfig();
    if (!config) return f('/login?google_error=not_configured');
    if (googleError) {
      console.error('[Google Auth] Provider error:', googleError);
      return f('/login?google_error=' + encodeURIComponent(googleError));
    }
    if (!code || !state) return f('/login?google_error=missing_params');
    if (!boundState || boundState !== state) return f('/login?google_error=invalid_state');

    const pending = this.google.consumeState(state);
    if (!pending) return f('/login?google_error=invalid_state');

    try {
      const doc = await this.google.discover(config.issuer, config.discoveryUrl);
      const tokenData = await this.google.exchangeCodeForToken(doc, code, pending.redirectUri, config.clientId, config.clientSecret, pending.codeVerifier);
      if (!tokenData._ok || !tokenData.access_token) {
        console.error('[Google Auth] Token exchange failed: status', tokenData._status);
        return f('/login?google_error=token_failed');
      }
      if (!tokenData.id_token) {
        console.error('[Google Auth] Token response missing id_token — refusing login');
        return f('/login?google_error=no_id_token');
      }
      const idVerify = await this.google.verifyIdToken(
        tokenData.id_token,
        doc,
        config.clientId,
        (doc.issuer ?? '').replace(/\/+$/, '') || config.issuer,
      );
      if (idVerify.ok !== true) {
        const reason = 'error' in idVerify ? idVerify.error : 'unknown';
        console.error('[Google Auth] id_token verification failed:', reason);
        return f('/login?google_error=id_token_invalid');
      }
      const userInfo = await this.google.getUserInfo(doc.userinfo_endpoint, tokenData.access_token);
      if (!userInfo.email) return f('/login?google_error=no_email');

      const tokenSub = idVerify.claims.sub;
      if (typeof tokenSub === 'string' && userInfo.sub && userInfo.sub !== tokenSub) {
        console.error('[Google Auth] userinfo.sub does not match id_token.sub — refusing login');
        return f('/login?google_error=subject_mismatch');
      }
      if (!userInfo.picture && typeof idVerify.claims.picture === 'string') {
        userInfo.picture = idVerify.claims.picture;
      }

      const result = this.google.findOrCreateUser(userInfo, config, pending.inviteToken);
      if ('error' in result) return f('/login?google_error=' + result.error);

      this.google.touchLastLogin(result.user.id);
      const jwtToken = this.google.generateToken(result.user);
      const authCode = this.google.createAuthCode(jwtToken);
      return f('/login?google_code=' + authCode);
    } catch (err: unknown) {
      console.error('[Google Auth] Callback error:', err);
      return f('/login?google_error=server_error');
    }
  }

  @Get('exchange')
  exchange(@Query('code') code: string | undefined, @Req() req: Request, @Res() res: Response): void {
    if (!code) {
      res.status(400).json({ error: 'Code required' });
      return;
    }
    const result = this.google.consumeAuthCode(code);
    if ('error' in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    this.google.setAuthCookie(res, result.token, req);
    res.json({ token: result.token });
  }
}
