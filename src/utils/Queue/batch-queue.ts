import { v4 } from 'uuid';
import { BatchProcessor, QueueItem, QueueOptions } from './types';

export class BatchingQueue<T, R = void> {
  private queue: QueueItem<T>[] = [];
  private isProcessing = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly options: Required<QueueOptions>;
  private readonly processor: BatchProcessor<T, R>;

  constructor(processor: BatchProcessor<T, R>, options: QueueOptions) {
    this.processor = processor;
    this.options = {
      maxQueueSize: 10000,
      onError: error => console.error('Queue processing error:', error),
      onBatchProcessed: () => {},
      ...options,
    };
  }
  /**
   * Add a single item to the queue
   */
  offer(data: T): boolean {
    if (this.queue.length >= this.options.maxQueueSize) {
      return false; // Queue is full
    }

    const item: QueueItem<T> = {
      data,
      timestamp: Date.now(),
      id: this.generateId(),
    };

    this.queue.push(item);
    this.scheduleFlush();
    return true;
  }

  /**
   * Add multiple items to the queue
   */
  offerAll(items: T[]): number {
    let added = 0;
    for (const item of items) {
      if (this.offer(item)) {
        added++;
      } else {
        break; // Queue is full
      }
    }
    return added;
  }

  /**
   * Get current queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Force flush the current queue
   */
  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.processBatch();
  }

  /**
   * Clear all items from the queue
   */
  clear(): void {
    this.queue = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Shutdown the queue and process remaining items
   */
  async shutdown(): Promise<void> {
    await this.flush();
  }

  private scheduleFlush(): void {
    // If we've reached batch size, process immediately
    if (this.queue.length >= this.options.batchSize) {
      this.processBatch();
      return;
    }

    // If no timer is set, schedule one
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.processBatch();
      }, this.options.flushInterval);
    }
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Extract batch to process
      const batchSize = Math.min(this.options.batchSize, this.queue.length);
      const batch = this.queue.splice(0, batchSize);
      const data = batch.map(item => item.data);

      const startTime = Date.now();

      // Process the batch
      await this.processor(data);

      const processingTime = Date.now() - startTime;
      this.options.onBatchProcessed(batchSize, processingTime);

      // Clear the timer since we've processed
      if (this.flushTimer) {
        clearTimeout(this.flushTimer);
        this.flushTimer = null;
      }

      // If there are more items, schedule next batch
      if (this.queue.length > 0) {
        this.scheduleFlush();
      }
    } catch (error) {
      this.options.onError(error as Error);
    } finally {
      this.isProcessing = false;
    }
  }

  private generateId(): string {
    return v4();
  }
}
