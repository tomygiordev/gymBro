import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { sessionsTable, Session } from '../../../../database/schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionsRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async create(data: {
    userId: string;
    refreshTokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<Session> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(sessionsTable)
      .values({
        id: uuidv4(),
        ...data,
        createdAt: now,
        expiresAt: data.expiresAt.toISOString(),
      } as any)
      .returning();
    return result[0];
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.db
      .select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.userId, userId),
          isNull(sessionsTable.revokedAt),
        ),
      );
  }

  async findById(sessionId: string): Promise<Session | null> {
    const result = await this.db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, sessionId))
      .limit(1);
    return result[0] || null;
  }

  async revoke(sessionId: string): Promise<void> {
    await this.db
      .update(sessionsTable)
      .set({ revokedAt: new Date().toISOString() } as any)
      .where(eq(sessionsTable.id, sessionId));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db
      .update(sessionsTable)
      .set({ revokedAt: new Date().toISOString() } as any)
      .where(eq(sessionsTable.userId, userId));
  }

  async deleteExpired(): Promise<void> {
    await this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.revokedAt, new Date().toISOString()));
  }
}