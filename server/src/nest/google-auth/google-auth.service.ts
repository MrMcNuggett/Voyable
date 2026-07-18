import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as oidc from '../../services/oidcService';
import type { OidcConfig } from '../../services/oidcService';
import { getAppUrl } from '../../services/notifications';
import { setAuthCookie } from '../../services/cookie';

const GOOGLE_ISSUER = 'https://accounts.google.com';

/**
 * Google OIDC as an additional, parallel auth provider — Google is just
 * another OIDC IdP, so this delegates all the PKCE/discovery/id_token/
 * user-provisioning logic to the existing provider-agnostic oidcService.
 * The only Google-specific piece is where the config comes from (env vars
 * only, no admin-panel override) and the fixed issuer. This is deliberately
 * independent of the generic OIDC_* config so an instance can run Google
 * login alongside a different generic SSO provider at the same time.
 */
@Injectable()
export class GoogleAuthService {
  googleLoginEnabled(): boolean { return this.getGoogleConfig() !== null; }

  getGoogleConfig(): OidcConfig | null {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;
    return { issuer: GOOGLE_ISSUER, clientId, clientSecret, displayName: 'Google', discoveryUrl: null };
  }

  getAppUrl() { return getAppUrl(); }
  discover(issuer: string, discoveryUrl?: string | null) { return oidc.discover(issuer, discoveryUrl); }
  createState(redirectUri: string, inviteToken?: string) { return oidc.createState(redirectUri, inviteToken); }
  consumeState(state: string) { return oidc.consumeState(state); }
  exchangeCodeForToken(...args: Parameters<typeof oidc.exchangeCodeForToken>) { return oidc.exchangeCodeForToken(...args); }
  verifyIdToken(...args: Parameters<typeof oidc.verifyIdToken>) { return oidc.verifyIdToken(...args); }
  getUserInfo(endpoint: string, accessToken: string) { return oidc.getUserInfo(endpoint, accessToken); }
  findOrCreateUser(...args: Parameters<typeof oidc.findOrCreateUser>) { return oidc.findOrCreateUser(...args); }
  touchLastLogin(userId: number) { return oidc.touchLastLogin(userId); }
  generateToken(user: { id: number }) { return oidc.generateToken(user); }
  createAuthCode(token: string) { return oidc.createAuthCode(token); }
  consumeAuthCode(code: string) { return oidc.consumeAuthCode(code); }
  frontendUrl(path: string) { return oidc.frontendUrl(path); }
  setAuthCookie(res: Response, token: string, req: Request) { setAuthCookie(res, token, req); }
}
