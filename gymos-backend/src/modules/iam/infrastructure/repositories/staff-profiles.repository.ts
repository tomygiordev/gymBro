import { Injectable, Inject } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { staffProfilesTable, StaffProfile } from '../../../../database/schema';

@Injectable()
export class StaffProfilesRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async findByUserId(userId: string): Promise<StaffProfile | null> {
    const result = await this.db
      .select()
      .from(staffProfilesTable)
      .where(eq(staffProfilesTable.userId, userId))
      .limit(1);
    return result[0] || null;
  }

  async findById(id: string): Promise<StaffProfile | null> {
    const result = await this.db
      .select()
      .from(staffProfilesTable)
      .where(eq(staffProfilesTable.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByTenantAndUser(tenantId: string, userId: string): Promise<StaffProfile | null> {
    const result = await this.db
      .select()
      .from(staffProfilesTable)
      .where(
        and(
          eq(staffProfilesTable.tenantId, tenantId),
          eq(staffProfilesTable.userId, userId),
        ),
      )
      .limit(1);
    return result[0] || null;
  }

  async create(data: {
    userId: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<StaffProfile> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(staffProfilesTable)
      .values({ ...data, createdAt: now, updatedAt: now } as any)
      .returning();
    return result[0];
  }

  async update(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      avatarUrl: string;
    }>,
  ): Promise<StaffProfile> {
    const result = await this.db
      .update(staffProfilesTable)
      .set({ ...data, updatedAt: new Date().toISOString() } as any)
      .where(eq(staffProfilesTable.id, id))
      .returning();
    return result[0];
  }
}