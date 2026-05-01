import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import {
  membershipsTable,
  membershipChangesTable,
  membershipFreezesTable,
  plansTable,
  membersTable,
  Membership,
} from '../../../../database/schema';
import { MEMBERSHIP_STATUS, MEMBERSHIP_CHANGE_TYPES, MEMBERSHIP_WARNING_DAYS } from '../../../../shared/constants';
import { addDays, isWithinDays, isDateExpired } from '../../../../shared/utils';

interface MembershipWithPlan {
  id: string;
  memberId: string;
  planId: string;
  tenantId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  frozeAt: Date | null;
  frozeUntil: Date | null;
  autoRenew: boolean;
  planName: string;
  planPrice: number;
}

@Injectable()
export class MembershipsRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async findById(id: string): Promise<MembershipWithPlan | null> {
    const result = await this.db
      .select({
        id: membershipsTable.id,
        memberId: membershipsTable.memberId,
        planId: membershipsTable.planId,
        tenantId: membershipsTable.tenantId,
        status: membershipsTable.status,
        startDate: membershipsTable.startDate,
        endDate: membershipsTable.endDate,
        frozeAt: membershipsTable.frozeAt,
        frozeUntil: membershipsTable.frozeUntil,
        autoRenew: membershipsTable.autoRenew,
        planName: plansTable.name,
        planPrice: plansTable.priceMonthly,
      })
      .from(membershipsTable)
      .innerJoin(plansTable, eq(membershipsTable.planId, plansTable.id))
      .where(eq(membershipsTable.id, id))
      .limit(1);

    return (result[0] as any) || null;
  }

  async findActiveByMemberId(memberId: string): Promise<MembershipWithPlan | null> {
    const result = await this.db
      .select({
        id: membershipsTable.id,
        memberId: membershipsTable.memberId,
        planId: membershipsTable.planId,
        tenantId: membershipsTable.tenantId,
        status: membershipsTable.status,
        startDate: membershipsTable.startDate,
        endDate: membershipsTable.endDate,
        frozeAt: membershipsTable.frozeAt,
        frozeUntil: membershipsTable.frozeUntil,
        autoRenew: membershipsTable.autoRenew,
        planName: plansTable.name,
        planPrice: plansTable.priceMonthly,
      })
      .from(membershipsTable)
      .innerJoin(plansTable, eq(membershipsTable.planId, plansTable.id))
      .where(
        and(
          eq(membershipsTable.memberId, memberId),
          sql`${membershipsTable.status} IN ('active', 'warning')`,
        ),
      )
      .orderBy(desc(membershipsTable.startDate))
      .limit(1);

    return (result[0] as any) || null;
  }

  async findByMemberId(memberId: string): Promise<Membership[]> {
    return this.db
      .select()
      .from(membershipsTable)
      .where(eq(membershipsTable.memberId, memberId))
      .orderBy(desc(membershipsTable.startDate));
  }

  async create(data: {
    memberId: string;
    planId: string;
    tenantId: string;
    startDate: Date;
    endDate: Date;
    autoRenew?: boolean;
  }): Promise<Membership> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(membershipsTable)
      .values({
        ...data,
        status: MEMBERSHIP_STATUS.ACTIVE,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        autoRenew: data.autoRenew ? 1 : 0,
        createdAt: now,
        updatedAt: now,
      } as any)
      .returning();
    return result[0];
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db
      .update(membershipsTable)
      .set({ status, updatedAt: new Date().toISOString() } as any)
      .where(eq(membershipsTable.id, id));
  }

  async freeze(id: string, frozeUntil: Date, originalEndDate: Date): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .update(membershipsTable)
      .set({
        status: MEMBERSHIP_STATUS.FROZEN,
        frozeAt: now,
        frozeUntil: frozeUntil.toISOString(),
        updatedAt: now,
      } as any)
      .where(eq(membershipsTable.id, id));

    await this.db.insert(membershipFreezesTable).values({
      membershipId: id,
      tenantId: '',
      startedAt: now,
      endsAt: frozeUntil.toISOString(),
      originalEndDate: originalEndDate.toISOString(),
    } as any);
  }

  async unfreeze(id: string): Promise<void> {
    const membership = await this.findById(id);
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const freeze = await this.db
      .select()
      .from(membershipFreezesTable)
      .where(eq(membershipFreezesTable.membershipId, id))
      .orderBy(desc(membershipFreezesTable.startedAt))
      .limit(1);

    let newEndDate = membership.endDate;
    if (freeze[0]) {
      const endsAt = freeze[0].endsAt ? new Date(freeze[0].endsAt) : null;
      const startedAt = new Date(freeze[0].startedAt);
      if (endsAt) {
        const daysFrozen = Math.ceil(
          (endsAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        newEndDate = addDays(new Date(membership.endDate), daysFrozen);
      }
    }

    const now = new Date().toISOString();
    await this.db
      .update(membershipsTable)
      .set({
        status: MEMBERSHIP_STATUS.ACTIVE,
        frozeAt: null,
        frozeUntil: null,
        endDate: newEndDate instanceof Date ? newEndDate.toISOString() : newEndDate,
        updatedAt: now,
      } as any)
      .where(eq(membershipsTable.id, id));
  }

  async renew(id: string, newEndDate: Date): Promise<Membership> {
    const now = new Date().toISOString();
    const result = await this.db
      .update(membershipsTable)
      .set({
        status: MEMBERSHIP_STATUS.ACTIVE,
        endDate: newEndDate.toISOString(),
        updatedAt: now,
      } as any)
      .where(eq(membershipsTable.id, id))
      .returning();
    return result[0];
  }

  async getStatus(membership: MembershipWithPlan): Promise<'active' | 'warning' | 'expired' | 'frozen'> {
    if (membership.status === MEMBERSHIP_STATUS.FROZEN) {
      return MEMBERSHIP_STATUS.FROZEN;
    }

    if (isDateExpired(membership.endDate)) {
      return MEMBERSHIP_STATUS.EXPIRED;
    }

    if (isWithinDays(membership.endDate, MEMBERSHIP_WARNING_DAYS)) {
      return MEMBERSHIP_STATUS.WARNING;
    }

    return MEMBERSHIP_STATUS.ACTIVE;
  }
}