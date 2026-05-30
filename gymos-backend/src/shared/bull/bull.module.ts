import { Module, Global } from '@nestjs/common';

class NoOpQueue<T = unknown> {
  constructor(private readonly name: string) {}
  async add(_jobName: string, _data: T, _options?: unknown): Promise<{ id: string }> {
    return { id: `${this.name}-${Date.now()}` };
  }
  async getJob(): Promise<null> {
    return null;
  }
}

export const QUEUES = {
  EMAIL: 'email',
  NOTIFICATIONS: 'notifications',
  METRICS: 'metrics',
  AUDIT: 'audit',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

@Global()
@Module({
  providers: [
    ...Object.values(QUEUES).map((name) => ({
      provide: `BULL_QUEUE_${name.toUpperCase()}`,
      useValue: new NoOpQueue(name),
    })),
  ],
  exports: Object.values(QUEUES).map(
    (name) => `BULL_QUEUE_${name.toUpperCase()}`,
  ),
})
export class BullModule {}
