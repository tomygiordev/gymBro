import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleInstance, persistDatabase } from '../../../../database';
import { branchesTable, Branch } from '../../../../database/schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BranchesRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async findById(id: string): Promise<Branch | null> {
    const result = await this.db.select().from(branchesTable).where(eq(branchesTable.id, id)).limit(1);
    return result[0] || null;
  }

  async findByTenant(tenantId: string): Promise<Branch[]> {
    return this.db
      .select()
      .from(branchesTable)
      .where(and(eq(branchesTable.tenantId, tenantId), eq(branchesTable.isActive, 1)));
  }

  async create(data: {
    tenantId: string;
    name: string;
    address?: string;
    phone?: string;
    openingTime?: string;
    closingTime?: string;
  }): Promise<Branch> {
    const now = new Date().toISOString();
    const result = await this.db.insert(branchesTable).values({
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    } as any).returning();
    persistDatabase(this.db);
    return result[0];
  }
}
