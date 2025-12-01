/**
 * GitHub Repository Service
 * Handles repository creation and management operations
 */

export interface CreateRepoOptions {
  name: string;
  description: string;
  private: boolean;
  autoInit?: boolean;
  gitignoreTemplate?: string;
  licenseTemplate?: string;
}

export interface Repository {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  private: boolean;
  owner: {
    login: string;
  };
}

export interface NameAvailabilityResult {
  available: boolean;
  suggestions?: string[];
}

export class GitHubRepositoryService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Create a new GitHub repository
   */
  async createRepository(options: CreateRepoOptions): Promise<Repository> {
    // Validate repository name
    this.validateRepositoryName(options.name);

    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: options.name,
        description: options.description,
        private: options.private,
        auto_init: options.autoInit || false,
        gitignore_template: options.gitignoreTemplate,
        license_template: options.licenseTemplate,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 422) {
        if (error.errors?.some((e: any) => e.message?.includes('already exists'))) {
          throw new Error(`Repository "${options.name}" already exists`);
        }
        throw new Error(error.message || 'Invalid repository configuration');
      }
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      }
      
      if (response.status === 403) {
        if (error.message?.includes('rate limit')) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
        throw new Error('Permission denied. Please check your GitHub permissions.');
      }

      throw new Error(`Failed to create repository: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      htmlUrl: data.html_url,
      cloneUrl: data.clone_url,
      sshUrl: data.ssh_url,
      private: data.private,
      owner: {
        login: data.owner.login,
      },
    };
  }

  /**
   * Check if a repository name is available for the authenticated user
   */
  async checkAvailability(repoName: string): Promise<NameAvailabilityResult> {
    try {
      // Validate name format first
      this.validateRepositoryName(repoName);
    } catch (_error) {
      return {
        available: false,
        suggestions: this.generateNameSuggestions(repoName),
      };
    }

    // Get current user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user information');
    }

    const user = await userResponse.json();
    const username = user.login;

    // Check if repository exists
    const repoResponse = await fetch(
      `https://api.github.com/repos/${username}/${repoName}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (repoResponse.status === 404) {
      // Repository doesn't exist, name is available
      return { available: true };
    }

    if (repoResponse.ok) {
      // Repository exists
      return {
        available: false,
        suggestions: this.generateNameSuggestions(repoName),
      };
    }

    // Other error (rate limit, network, etc.)
    throw new Error('Failed to check repository availability');
  }

  /**
   * Validate repository name according to GitHub rules
   */
  private validateRepositoryName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Repository name cannot be empty');
    }

    if (name.length > 100) {
      throw new Error('Repository name cannot exceed 100 characters');
    }

    // GitHub repository name rules:
    // - Can contain alphanumeric characters, hyphens, underscores, and periods
    // - Cannot start with a period or hyphen
    // - Cannot end with .git
    const validNamePattern = /^[a-zA-Z0-9_][a-zA-Z0-9._-]*$/;
    
    if (!validNamePattern.test(name)) {
      throw new Error(
        'Repository name can only contain alphanumeric characters, hyphens, underscores, and periods, and cannot start with a period or hyphen'
      );
    }

    if (name.endsWith('.git')) {
      throw new Error('Repository name cannot end with .git');
    }

    // Reserved names
    const reservedNames = [
      'con', 'prn', 'aux', 'nul',
      'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
      'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9',
    ];

    if (reservedNames.includes(name.toLowerCase())) {
      throw new Error(`"${name}" is a reserved name and cannot be used`);
    }
  }

  /**
   * Generate alternative repository name suggestions
   */
  private generateNameSuggestions(baseName: string): string[] {
    const suggestions: string[] = [];
    const cleanName = baseName.replace(/\.git$/, '');

    // Add numeric suffixes
    suggestions.push(`${cleanName}-2`);
    suggestions.push(`${cleanName}-v2`);
    suggestions.push(`${cleanName}-new`);

    // Add date-based suffix
    const date = new Date();
    const year = date.getFullYear();
    suggestions.push(`${cleanName}-${year}`);

    // Add random suffix
    const randomSuffix = Math.floor(Math.random() * 1000);
    suggestions.push(`${cleanName}-${randomSuffix}`);

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<Repository> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found');
      }
      throw new Error(`Failed to fetch repository: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      htmlUrl: data.html_url,
      cloneUrl: data.clone_url,
      sshUrl: data.ssh_url,
      private: data.private,
      owner: {
        login: data.owner.login,
      },
    };
  }

  /**
   * Delete a repository (use with caution)
   */
  async deleteRepository(owner: string, repo: string): Promise<void> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found');
      }
      if (response.status === 403) {
        throw new Error('Permission denied. You may not have access to delete this repository.');
      }
      throw new Error(`Failed to delete repository: ${response.statusText}`);
    }
  }
}
