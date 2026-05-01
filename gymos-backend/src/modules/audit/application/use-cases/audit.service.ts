import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from '../../infrastructure/repositories/audit-logs.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async log(data: {
    tenantId?: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.auditLogsRepository.create({
      tenantId: data.tenantId || 'default',
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  async getLogs(tenantId: string, limit = 100) {
    return this.auditLogsRepository.findByTenant(tenantId, limit);
  }
}