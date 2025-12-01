/**
 * GitHub Integration Module
 * Exports all GitHub-related services and utilities
 */

export { githubOAuthService, GitHubOAuthService } from './oauth';
export type { GitHubUser, OAuthTokens } from './oauth';

export { CookieManager } from './cookie-manager';
export { GitHubAuthHelper } from './auth-helper';

export { GitHubRepositoryService } from './repository';
export type { CreateRepoOptions, Repository, NameAvailabilityResult } from './repository';

export { GitOperationsService } from './git-operations';
export type { GeneratedFile, GitAuthor, GitTree, GitBlob, GitCommit, GitReference } from './git-operations';

export { GitHubRateLimiter } from './rate-limiter';

export { sanitizeRepoName, isValidRepoName, generateUniqueRepoName } from './repo-name-sanitizer';
