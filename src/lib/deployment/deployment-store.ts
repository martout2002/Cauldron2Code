/**
 * Deployment Store
 * Simple in-memory storage for deployments
 * In production, this would be replaced with a database
 */

import type { Deployment } from '@/lib/platforms/types';

export class DeploymentStore {
  private deployments: Map<string, Deployment> = new Map();
  private userDeployments: Map<string, Set<string>> = new Map();

  /**
   * Save a deployment
   */
  save(deployment: Deployment): void {
    this.deployments.set(deployment.id, deployment);

    // Track user's deployments
    if (!this.userDeployments.has(deployment.userId)) {
      this.userDeployments.set(deployment.userId, new Set());
    }
    this.userDeployments.get(deployment.userId)!.add(deployment.id);
  }

  /**
   * Get a deployment by ID
   */
  get(deploymentId: string): Deployment | undefined {
    return this.deployments.get(deploymentId);
  }

  /**
   * Get all deployments for a user
   */
  getByUser(userId: string): Deployment[] {
    const deploymentIds = this.userDeployments.get(userId);
    if (!deploymentIds) {
      return [];
    }

    const deployments: Deployment[] = [];
    for (const id of deploymentIds) {
      const deployment = this.deployments.get(id);
      if (deployment) {
        deployments.push(deployment);
      }
    }

    // Sort by creation date (newest first)
    return deployments.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Update a deployment
   */
  update(deployment: Deployment): void {
    if (this.deployments.has(deployment.id)) {
      this.deployments.set(deployment.id, deployment);
    }
  }

  /**
   * Delete a deployment
   */
  delete(deploymentId: string): void {
    const deployment = this.deployments.get(deploymentId);
    if (deployment) {
      this.deployments.delete(deploymentId);

      // Remove from user's deployments
      const userDeployments = this.userDeployments.get(deployment.userId);
      if (userDeployments) {
        userDeployments.delete(deploymentId);
      }
    }
  }

  /**
   * Get all deployments (admin function)
   */
  getAll(): Deployment[] {
    return Array.from(this.deployments.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Clear all deployments (for testing)
   */
  clear(): void {
    this.deployments.clear();
    this.userDeployments.clear();
  }
}

// Singleton instance
let storeInstance: DeploymentStore | null = null;

export function getDeploymentStore(): DeploymentStore {
  if (!storeInstance) {
    storeInstance = new DeploymentStore();
  }
  return storeInstance;
}

