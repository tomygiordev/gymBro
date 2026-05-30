import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { DrizzleInstance, persistDatabase } from '../../../../database';
import {
  classSessionsTable,
  reservationsTable,
  reservationWaitlistTable,
  membersTable,
} from '../../../../database/schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SchedulingService {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async listClasses(tenantId: string, date?: string) {
    const filters = [
      eq(classSessionsTable.tenantId, tenantId),
      eq(classSessionsTable.isActive, 1),
    ];

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      filters.push(gte(classSessionsTable.startsAt, start.toISOString()));
      filters.push(lt(classSessionsTable.startsAt, end.toISOString()));
    }

    return this.db
      .select()
      .from(classSessionsTable)
      .where(and(...filters))
      .orderBy(classSessionsTable.startsAt);
  }

  async createClass(tenantId: string, data: any) {
    if (!data.branchId || !data.classType || !data.startsAt || !data.endsAt) {
      throw new BadRequestException('branchId, classType, startsAt and endsAt are required');
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    const result = await this.db
      .insert(classSessionsTable)
      .values({
        id,
        tenantId,
        branchId: data.branchId,
        classType: data.classType,
        instructorId: data.instructorId,
        roomName: data.roomName,
        startsAt: new Date(data.startsAt).toISOString(),
        endsAt: new Date(data.endsAt).toISOString(),
        maxCapacity: Number(data.maxCapacity || 15),
        currentCount: 0,
        waitlistEnabled: data.waitlistEnabled === false ? 0 : 1,
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      } as any)
      .returning();

    persistDatabase(this.db);
    return result[0];
  }

  async reserve(classSessionId: string, memberId: string) {
    const classSession = await this.findClassSession(classSessionId);
    const now = new Date().toISOString();

    if ((classSession.currentCount || 0) >= classSession.maxCapacity) {
      if (!classSession.waitlistEnabled) {
        throw new BadRequestException('Class is full');
      }

      const nextPosition = await this.nextWaitlistPosition(classSessionId);
      const waitlistResult = await this.db
        .insert(reservationWaitlistTable)
        .values({
          id: uuidv4(),
          classSessionId,
          memberId,
          tenantId: classSession.tenantId,
          position: nextPosition,
          status: 'waiting',
          createdAt: now,
        } as any)
        .returning();

      persistDatabase(this.db);
      return { ...waitlistResult[0], status: 'waiting' };
    }

    const reservationResult = await this.db
      .insert(reservationsTable)
      .values({
        id: uuidv4(),
        classSessionId,
        memberId,
        tenantId: classSession.tenantId,
        status: 'confirmed',
        createdAt: now,
      } as any)
      .returning();

    await this.db
      .update(classSessionsTable)
      .set({
        currentCount: (classSession.currentCount || 0) + 1,
        updatedAt: now,
      } as any)
      .where(eq(classSessionsTable.id, classSessionId));

    persistDatabase(this.db);
    return reservationResult[0];
  }

  async getWaitlist(classSessionId: string) {
    return this.db
      .select({
        id: reservationWaitlistTable.id,
        classSessionId: reservationWaitlistTable.classSessionId,
        memberId: reservationWaitlistTable.memberId,
        memberFirstName: membersTable.firstName,
        memberLastName: membersTable.lastName,
        position: reservationWaitlistTable.position,
        status: reservationWaitlistTable.status,
        promotedAt: reservationWaitlistTable.promotedAt,
        createdAt: reservationWaitlistTable.createdAt,
      })
      .from(reservationWaitlistTable)
      .leftJoin(membersTable, eq(reservationWaitlistTable.memberId, membersTable.id))
      .where(eq(reservationWaitlistTable.classSessionId, classSessionId))
      .orderBy(reservationWaitlistTable.position);
  }

  private async findClassSession(classSessionId: string) {
    const result = await this.db
      .select()
      .from(classSessionsTable)
      .where(eq(classSessionsTable.id, classSessionId))
      .limit(1);

    if (!result[0]) {
      throw new NotFoundException('Class session not found');
    }

    return result[0];
  }

  private async nextWaitlistPosition(classSessionId: string): Promise<number> {
    const result = await this.db
      .select({ maxPosition: sql<number>`coalesce(max(${reservationWaitlistTable.position}), 0)` })
      .from(reservationWaitlistTable)
      .where(eq(reservationWaitlistTable.classSessionId, classSessionId));

    return Number(result[0]?.maxPosition || 0) + 1;
  }
}
