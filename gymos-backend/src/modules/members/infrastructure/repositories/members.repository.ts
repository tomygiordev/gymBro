import { Injectable, Inject } from '@nestjs/common';
import { eq, and, or, ilike, isNull, desc } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { membersTable, Member } from '../../../../database/schema';
import { normalizePhone, normalizeDocumentNumber } from '../../../../shared/utils';

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
          or(
            ilike(membersTable.firstName, `%${normalizedQuery}%`),
            ilike(membersTable.lastName, `%${normalizedQuery}%`),
            ilike(membersTable.documentNumber, `%${docNormalized}%`),
            eq(membersTable.phoneNormalized, phoneNormalized),
          ),
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
        ...data,
        phoneNormalized,
        dateOfBirth: data.dateOfBirth?.toISOString(),
        createdAt: now,
        updatedAt: now,
      } as any)
      .returning();
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
    return result[0];
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(membersTable)
      .set({ deletedAt: new Date().toISOString(), isActive: 0 } as any)
      .where(eq(membersTable.id, id));
  }

  async countByTenant(tenantId: string): Promise<number> {
    const result = await this.db
      .select({ count: membersTable.id })
      .from(membersTable)
      .where(and(eq(membersTable.tenantId, tenantId), isNull(membersTable.deletedAt)));
    return result.length;
  }
}