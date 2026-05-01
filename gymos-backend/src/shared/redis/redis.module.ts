import { Module, Global, OnModuleDestroy } from '@nestjs/common';

class NoOpRedisService implements OnModuleDestroy {
  private cache = new Map<string, { value: unknown; expiresAt?: number }>();

  async get<T = string>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  async incr(key: string): Promise<number> {
    const val = (await this.get<number>(key)) ?? 0;
    const next = val + 1;
    await this.set(key, next);
    return next;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      item.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return [...this.cache.keys()].filter((k) => regex.test(k));
  }

  async ttl(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item || !item.expiresAt) return -1;
    return Math.floor((item.expiresAt - Date.now()) / 1000);
  }

  onModuleDestroy() {
    this.cache.clear();
  }
}

const NOOP_REDIS_SERVICE = Symbol('NOOP_REDIS_SERVICE');

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: {},
    },
    {
      provide: NOOP_REDIS_SERVICE,
      useValue: new NoOpRedisService(),
    },
  ],
  exports: ['REDIS_CLIENT', NOOP_REDIS_SERVICE],
})
export class RedisModule {}