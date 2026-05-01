import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { auditLogsTable, AuditLog } from '../../../../database/schema';

@Injectable()
export class AuditLogsRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async create(data: {
    tenantId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(auditLogsTable)
      .values({ ...data, id: crypto.randomUUID(), createdAt: now } as any)
      .returning();
    return result[0];
  }

  async findByTenant(tenantId: string, limit = 100): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogsTable)
      .where(eq(auditLogsTable.tenantId, tenantId))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.db
      .select()
      .from(auditLogsTable)
      .where(eq(auditLogsTable.entityId, entityId))
      .orderBy(desc(auditLogsTable.createdAt));
  }
}