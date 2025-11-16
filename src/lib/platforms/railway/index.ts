/**
 * Railway Platform Integration
 * Exports Railway OAuth service, cookie manager, and Railway service
 */

export { railwayOAuthService, RailwayOAuthService } from './oauth';
export { RailwayCookieManager } from './cookie-manager';
// export { RailwayService } from './railway-service'; // TODO: Implement in task 3

export type { RailwayUser, RailwayOAuthTokens } from './oauth';
