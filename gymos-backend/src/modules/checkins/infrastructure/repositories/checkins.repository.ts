import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, sql, gte, inArray } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import {
  checkinsTable,
  checkinAttemptsTable,
  membersTable,
} from '../../../../database/schema';
import { CheckinFeedResponseDto, CheckinFeedItemDto } from '../../presentation/dtos/checkins.dto';

@Injectable()
export class CheckinsRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async createCheckin(data: {
    memberId: string;
    membershipId?: string;
    branchId?: string;
    tenantId: string;
    checkinType?: string;
    classSessionId?: string;
  }): Promise<{ id: string }> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(checkinsTable)
      .values({ ...data, createdAt: now } as any)
      .returning({ id: checkinsTable.id });
    return result[0];
  }

  async createAttempt(data: {
    memberId: string;
    branchId?: string;
    tenantId: string;
    result: string;
    reason?: string;
    idempotencyKey?: string;
  }): Promise<{ id: string }> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(checkinAttemptsTable)
      .values({ ...data, createdAt: now } as any)
      .returning({ id: checkinAttemptsTable.id });
    return result[0];
  }

  async findTodayByTenant(tenantId: string, limit = 100): Promise<CheckinFeedItemDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const results = await this.db
      .select({
        id: checkinsTable.id,
        memberId: checkinsTable.memberId,
        checkinType: checkinsTable.checkinType,
        createdAt: checkinsTable.createdAt,
        memberFirstName: membersTable.firstName,
        memberLastName: membersTable.lastName,
      })
      .from(checkinsTable)
      .leftJoin(membersTable, eq(checkinsTable.memberId, membersTable.id))
      .where(
        and(
          eq(checkinsTable.tenantId, tenantId),
          gte(checkinsTable.createdAt, todayISO),
        ),
      )
      .orderBy(desc(checkinsTable.createdAt))
      .limit(limit);

    return results.map((r) => ({
      id: r.id,
      time: new Date(r.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      memberId: r.memberId,
      memberName: r.memberFirstName && r.memberLastName
        ? `${r.memberFirstName} ${r.memberLastName}`
        : 'Socio',
      checkinType: r.checkinType,
      status: 'success' as const,
    }));
  }

  async getTodayCount(tenantId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const results = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(checkinsTable)
      .where(
        and(
          eq(checkinsTable.tenantId, tenantId),
          gte(checkinsTable.createdAt, todayISO),
        ),
      );

    return Number(results[0]?.count) || 0;
  }

  async findLatestByMemberIds(memberIds: string[]): Promise<Record<string, string>> {
    if (memberIds.length === 0) {
      return {};
    }

    const results = await this.db
      .select({
        memberId: checkinsTable.memberId,
        createdAt: checkinsTable.createdAt,
      })
      .from(checkinsTable)
      .where(inArray(checkinsTable.memberId, memberIds))
      .orderBy(desc(checkinsTable.createdAt));

    const latest: Record<string, string> = {};
    for (const item of results) {
      if (!latest[item.memberId]) {
        latest[item.memberId] = item.createdAt;
      }
    }

    return latest;
  }
}
