import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleInstance, persistDatabase } from '../../../../database';
import { tenantsTable, Tenant } from '../../../../database/schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantsRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async findById(id: string): Promise<Tenant | null> {
    const result = await this.db.select().from(tenantsTable).where(eq(tenantsTable.id, id)).limit(1);
    return result[0] || null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const result = await this.db.select().from(tenantsTable).where(eq(tenantsTable.slug, slug)).limit(1);
    return result[0] || null;
  }

  async create(data: { name: string; slug: string; contactEmail: string; contactPhone?: string }): Promise<Tenant> {
    const now = new Date().toISOString();
    const result = await this.db.insert(tenantsTable).values({
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    } as any).returning();
    persistDatabase(this.db);
    return result[0];
  }
}
