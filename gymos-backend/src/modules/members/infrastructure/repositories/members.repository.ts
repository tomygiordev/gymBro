import { Injectable, Inject } from '@nestjs/common';
import { eq, and, or, like, isNull, desc, sql } from 'drizzle-orm';
import { DrizzleInstance, persistDatabase } from '../../../../database';
import { membersTable, Member } from '../../../../database/schema';
import { normalizePhone, normalizeDocumentNumber } from '../../../../shared/utils';
import { v4 as uuidv4 } from 'uuid';

export interface MemberSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string | null;
  phone: string | null;
  membershipStatus: 'active' | 'warning' | 'expired' | 'frozen' | 'none';
  membershipPlanName: string | null;
  membershipEndDate: Date | null;
}

@Injectable()
export class MembersRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async findById(id: string): Promise<Member | null> {
    const result = await this.db
      .select()
      .from(membersTable)
      .where(and(eq(membersTable.id, id), isNull(membersTable.deletedAt)))
      .limit(1);
    return result[0] || null;
  }

  async findByTenant(tenantId: string, limit = 50, cursor?: string): Promise<Member[]> {
    const baseQuery = this.db
      .select()
      .from(membersTable)
      .where(and(eq(membersTable.tenantId, tenantId), isNull(membersTable.deletedAt)))
      .orderBy(desc(membersTable.createdAt))
      .limit(limit);

    if (cursor) {
      return this.db
        .select()
        .from(membersTable)
        .where(and(
          eq(membersTable.tenantId, tenantId),
          isNull(membersTable.deletedAt),
        ))
        .orderBy(desc(membersTable.createdAt))
        .limit(limit);
    }

    return baseQuery;
  }

  async search(tenantId: string, query: string, limit = 10): Promise<MemberSearchResult[]> {
    const normalizedQuery = query.trim().toLowerCase();
    const phoneNormalized = normalizePhone(query);
    const docNormalized = normalizeDocumentNumber(query);
    const searchConditions = [
      like(membersTable.firstName, `%${normalizedQuery}%`),
      like(membersTable.lastName, `%${normalizedQuery}%`),
      like(membersTable.email, `%${normalizedQuery}%`),
    ];

    if (docNormalized) {
      searchConditions.push(like(membersTable.documentNumber, `%${docNormalized}%`));
    }

    if (phoneNormalized) {
      searchConditions.push(like(membersTable.phoneNormalized, `%${phoneNormalized}%`));
    }

    const results = await this.db
      .select({
        id: membersTable.id,
        firstName: membersTable.firstName,
        lastName: membersTable.lastName,
        documentNumber: membersTable.documentNumber,
        phone: membersTable.phone,
        phoneNormalized: membersTable.phoneNormalized,
      })
      .from(membersTable)
      .where(
        and(
          eq(membersTable.tenantId, tenantId),
          isNull(membersTable.deletedAt),
          or(...searchConditions),
        ),
      )
      .limit(limit);

    return results.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      documentNumber: r.documentNumber,
      phone: r.phone,
      membershipStatus: 'none' as const,
      membershipPlanName: null,
      membershipEndDate: null,
    }));
  }

  async create(data: {
    tenantId: string;
    firstName: string;
    lastName: string;
    documentType?: string;
    documentNumber?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: Date;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    notes?: string;
  }): Promise<Member> {
    const phoneNormalized = data.phone ? normalizePhone(data.phone) : null;
    const now = new Date().toISOString();

    const result = await this.db
      .insert(membersTable)
      .values({
        id: uuidv4(),
        ...data,
        phoneNormalized,
        dateOfBirth: data.dateOfBirth?.toISOString(),
        createdAt: now,
        updatedAt: now,
      } as any)
      .returning();
    persistDatabase(this.db);
    return result[0];
  }

  async update(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    notes: string;
    photoUrl: string;
  }>): Promise<Member> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.phone) {
      updateData.phoneNormalized = normalizePhone(data.phone);
    }
    if (data.dateOfBirth) {
      updateData.dateOfBirth = data.dateOfBirth.toISOString();
    }

    const result = await this.db
      .update(membersTable)
      .set({ ...updateData, updatedAt: new Date().toISOString() } as any)
      .where(eq(membersTable.id, id))
      .returning();
    persistDatabase(this.db);
    return result[0];
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(membersTable)
      .set({ deletedAt: new Date().toISOString(), isActive: 0 } as any)
      .where(eq(membersTable.id, id));
    persistDatabase(this.db);
  }

  async countByTenant(tenantId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(membersTable)
      .where(and(eq(membersTable.tenantId, tenantId), isNull(membersTable.deletedAt)));
    return Number(result[0]?.count) || 0;
  }
}
