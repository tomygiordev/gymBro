import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { staffProfilesTable } from '../../../../database/schema';

@Injectable()
export class StaffService {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async list(tenantId: string) {
    return this.db
      .select()
      .from(staffProfilesTable)
      .where(and(eq(staffProfilesTable.tenantId, tenantId), eq(staffProfilesTable.isActive, 1)));
  }

  async getById(id: string) {
    const result = await this.db
      .select()
      .from(staffProfilesTable)
      .where(eq(staffProfilesTable.id, id))
      .limit(1);

    if (!result[0]) {
      throw new NotFoundException('Staff member not found');
    }

    return result[0];
  }
}
