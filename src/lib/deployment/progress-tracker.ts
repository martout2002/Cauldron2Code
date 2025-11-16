/**
 * Deployment Progress Tracker
 * Manages real-time progress updates and build log streaming for deployments
 * with optimizations for batching and log history limits
 */

import type { Deployment } from '@/lib/platforms/types';

export type ServiceProgress = {
  name: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  message: string;
  url?: string;
  buildLogs?: string[];
};

export type ProgressUpdate = {
  deploymentId: string;
  status: Deployment['status'];
  message: string;
  timestamp: Date;
  buildLogs?: string[];
  deploymentUrl?: string;
  error?: Deployment['error'];
  services?: ServiceProgress[]; // For monorepo deployments
};

type ProgressSubscriber = (update: ProgressUpdate) => void;

/**
 * ProgressTracker manages deployment progress updates and provides
 * a subscription system for real-time updates via Server-Sent Events
 * 
 * Performance optimizations:
 * - Batches log updates to reduce SSE messages
 * - Limits log history to last 1000 lines
 * - Implements log compression for storage
 */
export class ProgressTracker {
  private subscribers: Map<string, Set<ProgressSubscriber>> = new Map();
  private deploymentStates: Map<string, ProgressUpdate> = new Map();
  private logBatches: Map<string, string[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  
  // Configuration
  private readonly MAX_LOG_LINES = 1000;
  private readonly BATCH_DELAY_MS = 500; // Batch logs for 500ms before sending

  /**
   * Subscribe to progress updates for a specific deployment
   * @param deploymentId - The deployment ID to track
   * @param callback - Function called when progress updates occur
   * @returns Unsubscribe function
   */
  subscribe(deploymentId: string, callback: ProgressSubscriber): () => void {
    if (!this.subscribers.has(deploymentId)) {
      this.subscribers.set(deploymentId, new Set());
    }

    this.subscribers.get(deploymentId)!.add(callback);

    // Send current state immediately if available
    const currentState = this.deploymentStates.get(deploymentId);
    if (currentState) {
      callback(currentState);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(deploymentId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(deploymentId);
        }
      }
    };
  }

  /**
   * Update deployment progress with a status message
   * @param deploymentId - The deployment ID
   * @param message - Progress message to display
   * @param status - Optional status override
   */
  update(
    deploymentId: string,
    message: string,
    status?: Deployment['status']
  ): void {
    const currentState = this.deploymentStates.get(deploymentId);
    const update: ProgressUpdate = {
      deploymentId,
      status: status || currentState?.status || 'pending',
      message,
      timestamp: new Date(),
      buildLogs: currentState?.buildLogs || [],
    };

    this.deploymentStates.set(deploymentId, update);
    this.notifySubscribers(deploymentId, update);
  }

  /**
   * Add build log entries to the deployment (batched for performance)
   * @param deploymentId - The deployment ID
   * @param logs - Log entries to add (single string or array)
   */
  updateLogs(deploymentId: string, logs: string | string[]): void {
    const logArray = Array.isArray(logs) ? logs : [logs];
    
    // Add logs to batch
    if (!this.logBatches.has(deploymentId)) {
      this.logBatches.set(deploymentId, []);
    }
    this.logBatches.get(deploymentId)!.push(...logArray);
    
    // Clear existing timer
    const existingTimer = this.batchTimers.get(deploymentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer to flush batch
    const timer = setTimeout(() => {
      this.flushLogBatch(deploymentId);
    }, this.BATCH_DELAY_MS);
    
    this.batchTimers.set(deploymentId, timer);
  }

  /**
   * Flush batched logs and send update to subscribers
   * @param deploymentId - The deployment ID
   */
  private flushLogBatch(deploymentId: string): void {
    const batch = this.logBatches.get(deploymentId);
    if (!batch || batch.length === 0) {
      return;
    }

    const currentState = this.deploymentStates.get(deploymentId);
    const existingLogs = currentState?.buildLogs || [];
    
    // Combine existing logs with new batch
    let allLogs = [...existingLogs, ...batch];
    
    // Limit to last MAX_LOG_LINES
    if (allLogs.length > this.MAX_LOG_LINES) {
      allLogs = allLogs.slice(-this.MAX_LOG_LINES);
    }
    
    const update: ProgressUpdate = {
      deploymentId,
      status: currentState?.status || 'building',
      message: currentState?.message || 'Building...',
      timestamp: new Date(),
      buildLogs: allLogs,
    };

    this.deploymentStates.set(deploymentId, update);
    this.notifySubscribers(deploymentId, update);
    
    // Clear batch
    this.logBatches.set(deploymentId, []);
    this.batchTimers.delete(deploymentId);
  }

  /**
   * Mark deployment as complete with success
   * @param deploymentId - The deployment ID
   * @param deploymentUrl - The URL of the deployed application
   */
  complete(deploymentId: string, deploymentUrl: string): void {
    // Flush any pending log batches
    this.flushLogBatch(deploymentId);
    
    const currentState = this.deploymentStates.get(deploymentId);
    const update: ProgressUpdate = {
      deploymentId,
      status: 'success',
      message: 'Deployment complete!',
      timestamp: new Date(),
      buildLogs: currentState?.buildLogs || [],
      deploymentUrl,
    };

    this.deploymentStates.set(deploymentId, update);
    this.notifySubscribers(deploymentId, update);

    // Clean up after a delay to allow final updates to be received
    setTimeout(() => {
      this.cleanup(deploymentId);
    }, 30000); // 30 seconds
  }

  /**
   * Mark deployment as failed with error details
   * @param deploymentId - The deployment ID
   * @param error - Error details
   */
  fail(deploymentId: string, error: Deployment['error']): void {
    // Flush any pending log batches
    this.flushLogBatch(deploymentId);
    
    const currentState = this.deploymentStates.get(deploymentId);
    const update: ProgressUpdate = {
      deploymentId,
      status: 'failed',
      message: error?.message || 'Deployment failed',
      timestamp: new Date(),
      buildLogs: currentState?.buildLogs || [],
      error,
    };

    this.deploymentStates.set(deploymentId, update);
    this.notifySubscribers(deploymentId, update);

    // Clean up after a delay
    setTimeout(() => {
      this.cleanup(deploymentId);
    }, 30000); // 30 seconds
  }

  /**
   * Get the current state of a deployment
   * @param deploymentId - The deployment ID
   * @returns Current progress update or undefined
   */
  getState(deploymentId: string): ProgressUpdate | undefined {
    return this.deploymentStates.get(deploymentId);
  }

  /**
   * Notify all subscribers of a progress update
   * @param deploymentId - The deployment ID
   * @param update - The progress update
   */
  private notifySubscribers(deploymentId: string, update: ProgressUpdate): void {
    const subscribers = this.subscribers.get(deploymentId);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in progress subscriber:', error);
        }
      });
    }
  }

  /**
   * Clean up deployment state and subscribers
   * @param deploymentId - The deployment ID
   */
  private cleanup(deploymentId: string): void {
    // Clear any pending batch timers
    const timer = this.batchTimers.get(deploymentId);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(deploymentId);
    }
    
    // Clear batch data
    this.logBatches.delete(deploymentId);
    
    // Clear state and subscribers
    this.deploymentStates.delete(deploymentId);
    this.subscribers.delete(deploymentId);
  }

  /**
   * Update progress for a specific service in a monorepo deployment
   * @param deploymentId - The deployment ID
   * @param serviceName - Name of the service
   * @param status - Service status
   * @param message - Progress message
   * @param url - Optional service URL
   */
  updateService(
    deploymentId: string,
    serviceName: string,
    status: ServiceProgress['status'],
    message: string,
    url?: string
  ): void {
    const currentState = this.deploymentStates.get(deploymentId);
    const services = currentState?.services || [];

    // Find or create service progress
    const serviceIndex = services.findIndex((s) => s.name === serviceName);
    const serviceProgress: ServiceProgress = {
      name: serviceName,
      status,
      message,
      url,
      buildLogs: [],
    };

    if (serviceIndex >= 0) {
      services[serviceIndex] = {
        ...services[serviceIndex],
        ...serviceProgress,
      };
    } else {
      services.push(serviceProgress);
    }

    const update: ProgressUpdate = {
      deploymentId,
      status: currentState?.status || 'pending',
      message: currentState?.message || message,
      timestamp: new Date(),
      buildLogs: currentState?.buildLogs || [],
      services,
    };

    this.deploymentStates.set(deploymentId, update);
    this.notifySubscribers(deploymentId, update);
  }

  /**
   * Add build logs for a specific service (batched for performance)
   * @param deploymentId - The deployment ID
   * @param serviceName - Name of the service
   * @param logs - Log entries to add
   */
  updateServiceLogs(
    deploymentId: string,
    serviceName: string,
    logs: string | string[]
  ): void {
    const logArray = Array.isArray(logs) ? logs : [logs];
    const batchKey = `${deploymentId}:${serviceName}`;
    
    // Add logs to batch
    if (!this.logBatches.has(batchKey)) {
      this.logBatches.set(batchKey, []);
    }
    this.logBatches.get(batchKey)!.push(...logArray);
    
    // Clear existing timer
    const existingTimer = this.batchTimers.get(batchKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer to flush batch
    const timer = setTimeout(() => {
      this.flushServiceLogBatch(deploymentId, serviceName);
    }, this.BATCH_DELAY_MS);
    
    this.batchTimers.set(batchKey, timer);
  }

  /**
   * Flush batched service logs and send update to subscribers
   * @param deploymentId - The deployment ID
   * @param serviceName - Name of the service
   */
  private flushServiceLogBatch(deploymentId: string, serviceName: string): void {
    const batchKey = `${deploymentId}:${serviceName}`;
    const batch = this.logBatches.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }

    const currentState = this.deploymentStates.get(deploymentId);
    const services = currentState?.services || [];

    // Find service and update logs
    const serviceIndex = services.findIndex((s) => s.name === serviceName);
    if (serviceIndex >= 0 && services[serviceIndex]) {
      const existingLogs = services[serviceIndex]!.buildLogs || [];
      let allLogs = [...existingLogs, ...batch];
      
      // Limit to last MAX_LOG_LINES
      if (allLogs.length > this.MAX_LOG_LINES) {
        allLogs = allLogs.slice(-this.MAX_LOG_LINES);
      }
      
      services[serviceIndex]!.buildLogs = allLogs;
    }

    const update: ProgressUpdate = {
      deploymentId,
      status: currentState?.status || 'building',
      message: currentState?.message || 'Building...',
      timestamp: new Date(),
      buildLogs: currentState?.buildLogs || [],
      services,
    };

    this.deploymentStates.set(deploymentId, update);
    this.notifySubscribers(deploymentId, update);
    
    // Clear batch
    this.logBatches.delete(batchKey);
    this.batchTimers.delete(batchKey);
  }

  /**
   * Complete a monorepo deployment with multiple service URLs
   * @param deploymentId - The deployment ID
   * @param serviceUrls - Map of service names to URLs
   */
  completeMultiService(
    deploymentId: string,
    serviceUrls: Map<string, string>
  ): void {
    const currentState = this.deploymentStates.get(deploymentId);
    const services = currentState?.services || [];

    // Update all services with their URLs
    if (services) {
      services.forEach((service) => {
        const url = serviceUrls.get(service.name);
        if (url) {
          service.url = url;
          service.status = 'success';
        }
      });
    }

    const allUrls = Array.from(serviceUrls.values()).join(', ');
    const update: ProgressUpdate = {
      deploymentId,
      status: 'success',
      message: 'All services deployed successfully!',
      timestamp: new Date(),
      buildLogs: currentState?.buildLogs || [],
      deploymentUrl: allUrls,
      services,
    };

    this.deploymentStates.set(deploymentId, update);
    this.notifySubscribers(deploymentId, update);

    // Clean up after a delay
    setTimeout(() => {
      this.cleanup(deploymentId);
    }, 30000); // 30 seconds
  }

  /**
   * Get service-specific progress
   * @param deploymentId - The deployment ID
   * @param serviceName - Name of the service
   * @returns Service progress or undefined
   */
  getServiceState(
    deploymentId: string,
    serviceName: string
  ): ServiceProgress | undefined {
    const state = this.deploymentStates.get(deploymentId);
    return state?.services?.find((s) => s.name === serviceName);
  }

  /**
   * Force cleanup of a deployment (useful for testing or manual cleanup)
   * @param deploymentId - The deployment ID
   */
  forceCleanup(deploymentId: string): void {
    this.cleanup(deploymentId);
  }

  /**
   * Compress logs for storage by removing duplicate lines and trimming whitespace
   * @param logs - Array of log lines
   * @returns Compressed log array
   */
  compressLogs(logs: string[]): string[] {
    const compressed: string[] = [];
    const seen = new Set<string>();
    let duplicateCount = 0;

    for (const log of logs) {
      const trimmed = log.trim();
      
      // Skip empty lines
      if (!trimmed) {
        continue;
      }

      // Track duplicate consecutive lines
      if (seen.has(trimmed)) {
        duplicateCount++;
        continue;
      }

      // If we had duplicates, add a summary line
      if (duplicateCount > 0) {
        compressed.push(`... (${duplicateCount} duplicate lines omitted)`);
        duplicateCount = 0;
      }

      compressed.push(trimmed);
      seen.add(trimmed);
    }

    // Add final duplicate summary if needed
    if (duplicateCount > 0) {
      compressed.push(`... (${duplicateCount} duplicate lines omitted)`);
    }

    return compressed;
  }

  /**
   * Get compressed logs for a deployment
   * @param deploymentId - The deployment ID
   * @returns Compressed log array or undefined
   */
  getCompressedLogs(deploymentId: string): string[] | undefined {
    const state = this.deploymentStates.get(deploymentId);
    if (!state?.buildLogs) {
      return undefined;
    }
    return this.compressLogs(state.buildLogs);
  }

  /**
   * Flush all pending log batches immediately
   * Useful before shutdown or for testing
   */
  flushAllBatches(): void {
    for (const [key] of this.logBatches.entries()) {
      if (key.includes(':')) {
        // Service log batch
        const parts = key.split(':');
        const deploymentId = parts[0];
        const serviceName = parts[1];
        if (deploymentId && serviceName) {
          this.flushServiceLogBatch(deploymentId, serviceName);
        }
      } else {
        // Regular log batch
        this.flushLogBatch(key);
      }
    }
  }
}

// Singleton instance for use across the application
let progressTrackerInstance: ProgressTracker | null = null;

/**
 * Get the singleton ProgressTracker instance
 * @returns The ProgressTracker instance
 */
export function getProgressTracker(): ProgressTracker {
  if (!progressTrackerInstance) {
    progressTrackerInstance = new ProgressTracker();
  }
  return progressTrackerInstance;
}
