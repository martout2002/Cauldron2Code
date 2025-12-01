/**
 * Repository Name Sanitization
 * 
 * Sanitizes project names to comply with GitHub repository naming rules:
 * - Only alphanumeric characters, hyphens, and underscores
 * - Cannot start with a hyphen
 * - Maximum 100 characters
 * 
 * Requirements: 7.4
 */

/**
 * Sanitizes a project name to be a valid GitHub repository name
 * 
 * @param name - The project name to sanitize
 * @returns A valid GitHub repository name
 * 
 * @example
 * sanitizeRepoName("My Project!") // "my-project"
 * sanitizeRepoName("--test--") // "test"
 * sanitizeRepoName("a".repeat(150)) // "a".repeat(100)
 */
export function sanitizeRepoName(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'untitled-project';
  }

  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-') // Replace invalid characters with hyphens
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens into one
    .replace(/^_+/, '') // Remove leading underscores (GitHub convention)
    .replace(/-+$/, '') // Remove trailing hyphens
    .replace(/_+$/, '') // Remove trailing underscores
    .substring(0, 100) // Limit to 100 characters
    .replace(/-+$/, '') // Remove trailing hyphens again after truncation
    || 'untitled-project'; // Fallback if result is empty
}

/**
 * Validates if a repository name is valid according to GitHub rules
 * 
 * @param name - The repository name to validate
 * @returns True if the name is valid, false otherwise
 */
export function isValidRepoName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  // Check length
  if (name.length === 0 || name.length > 100) {
    return false;
  }

  // Check if it starts with a hyphen
  if (name.startsWith('-')) {
    return false;
  }

  // Check if it contains only valid characters
  const validPattern = /^[a-z0-9_-]+$/i;
  return validPattern.test(name);
}

/**
 * Generates a unique repository name by appending a suffix if needed
 * 
 * @param baseName - The base repository name
 * @param existingNames - Array of existing repository names to check against
 * @returns A unique repository name
 */
export function generateUniqueRepoName(
  baseName: string,
  existingNames: string[]
): string {
  const sanitized = sanitizeRepoName(baseName);
  
  if (!existingNames.includes(sanitized)) {
    return sanitized;
  }

  // Try appending numbers until we find a unique name
  let counter = 1;
  let uniqueName = `${sanitized}-${counter}`;
  
  while (existingNames.includes(uniqueName) && counter < 1000) {
    counter++;
    uniqueName = `${sanitized}-${counter}`;
  }

  // If we still can't find a unique name, append timestamp
  if (existingNames.includes(uniqueName)) {
    const timestamp = Date.now().toString(36);
    uniqueName = `${sanitized}-${timestamp}`.substring(0, 100);
  }

  return uniqueName;
}
