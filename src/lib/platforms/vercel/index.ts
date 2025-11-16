/**
 * Vercel Platform Integration
 * Exports Vercel-specific OAuth and service implementations
 */

export { getVercelOAuthService, VercelOAuthService } from './oauth';
export type { VercelUser, VercelOAuthTokens } from './oauth';
export { VercelCookieManager } from './cookie-manager';
export { VercelService } from './vercel-service';
