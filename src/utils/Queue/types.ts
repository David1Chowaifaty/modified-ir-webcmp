export type QueueItem<T> = {
  data: T;
  timestamp: number;
  id: string;
};

export type BatchProcessor<T, R> = (batch: T[]) => Promise<R>;

export type QueueOptions = {
  batchSize: number;
  flushInterval: number; // milliseconds
  maxQueueSize?: number;
  onError?: (error: Error) => void;
  onBatchProcessed?: (batchSize: number, processingTime: number) => void;
};
