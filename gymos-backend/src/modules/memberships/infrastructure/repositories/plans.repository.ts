import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { plansTable, Plan } from '../../../../database/schema';

@Injectable()
export class PlansRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async findById(id: string): Promise<Plan | null> {
    const result = await this.db
      .select()
      .from(plansTable)
      .where(eq(plansTable.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByTenant(tenantId: string): Promise<Plan[]> {
    return this.db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.tenantId, tenantId), eq(plansTable.isActive, 1)))
      .orderBy(plansTable.sortOrder);
  }

  async create(data: {
    tenantId: string;
    name: string;
    description?: string;
    priceMonthly: number;
    currency?: string;
    durationDays?: number;
    features?: string[];
    allowsGroupClasses?: boolean;
    groupClassesPerMonth?: number;
    allowsAllBranches?: boolean;
    includesPersonalTraining?: boolean;
    personalTrainingSessions?: number;
    sortOrder?: number;
  }): Promise<Plan> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(plansTable)
      .values({
        ...data,
        features: data.features ? JSON.stringify(data.features) : undefined,
        allowsGroupClasses: data.allowsGroupClasses ? 1 : 0,
        allowsAllBranches: data.allowsAllBranches ? 1 : 0,
        includesPersonalTraining: data.includesPersonalTraining ? 1 : 0,
        createdAt: now,
        updatedAt: now,
      } as any)
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    priceMonthly: number;
    durationDays: number;
    features: string[];
    allowsGroupClasses: boolean;
    groupClassesPerMonth: number;
    allowsAllBranches: boolean;
    includesPersonalTraining: boolean;
    personalTrainingSessions: number;
    sortOrder: number;
    isActive: boolean;
  }>): Promise<Plan> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.features) {
      updateData.features = JSON.stringify(data.features);
    }
    if (data.allowsGroupClasses !== undefined) {
      updateData.allowsGroupClasses = data.allowsGroupClasses ? 1 : 0;
    }
    if (data.allowsAllBranches !== undefined) {
      updateData.allowsAllBranches = data.allowsAllBranches ? 1 : 0;
    }
    if (data.includesPersonalTraining !== undefined) {
      updateData.includesPersonalTraining = data.includesPersonalTraining ? 1 : 0;
    }

    const result = await this.db
      .update(plansTable)
      .set({ ...updateData, updatedAt: new Date().toISOString() } as any)
      .where(eq(plansTable.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(plansTable)
      .set({ isActive: 0, updatedAt: new Date().toISOString() } as any)
      .where(eq(plansTable.id, id));
  }
}