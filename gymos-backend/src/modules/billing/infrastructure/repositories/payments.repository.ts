import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { paymentsTable, Payment } from '../../../../database/schema';

@Injectable()
export class PaymentsRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async findById(id: string): Promise<Payment | null> {
    const result = await this.db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByMemberId(memberId: string): Promise<Payment[]> {
    return this.db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.memberId, memberId))
      .orderBy(desc(paymentsTable.processedAt));
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    return this.db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.invoiceId, invoiceId));
  }

  async create(data: {
    invoiceId?: string;
    memberId: string;
    tenantId: string;
    amount: number;
    currency?: string;
    method: string;
    status?: string;
    transactionRef?: string;
  }): Promise<Payment> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(paymentsTable)
      .values({ ...data, createdAt: now } as any)
      .returning();
    return result[0];
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db
      .update(paymentsTable)
      .set({ status })
      .where(eq(paymentsTable.id, id));
  }
}