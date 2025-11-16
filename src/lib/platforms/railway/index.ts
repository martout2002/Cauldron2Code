/**
 * Railway Platform Integration
 * Exports Railway OAuth service, cookie manager, and Railway service
 */

export { getRailwayOAuthService, RailwayOAuthService } from './oauth';
export { RailwayCookieManager } from './cookie-manager';
export { RailwayService } from './railway-service';

export type { RailwayUser, RailwayOAuthTokens } from './oauth';
