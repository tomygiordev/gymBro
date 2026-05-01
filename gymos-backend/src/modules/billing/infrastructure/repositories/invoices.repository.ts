import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { invoicesTable, invoiceItemsTable, Invoice, InvoiceItem } from '../../../../database/schema';
import { generateInvoiceNumber } from '../../../../shared/utils';

@Injectable()
export class InvoicesRepository {
  constructor(@Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance) {}

  async findById(id: string): Promise<Invoice | null> {
    const result = await this.db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByMemberId(memberId: string): Promise<Invoice[]> {
    return this.db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.memberId, memberId))
      .orderBy(desc(invoicesTable.createdAt));
  }

  async findByTenantAndStatus(tenantId: string, status: string): Promise<Invoice[]> {
    return this.db
      .select()
      .from(invoicesTable)
      .where(and(eq(invoicesTable.tenantId, tenantId), eq(invoicesTable.status, status)))
      .orderBy(desc(invoicesTable.createdAt));
  }

  async create(data: {
    memberId: string;
    membershipId?: string;
    tenantId: string;
    invoiceNumber: string;
    status?: string;
    subtotal: number;
    discount?: number;
    total: number;
    dueDate: Date;
    paymentMethod?: string;
    notes?: string;
  }): Promise<Invoice> {
    const now = new Date().toISOString();
    const result = await this.db
      .insert(invoicesTable)
      .values({
        ...data,
        dueDate: data.dueDate.toISOString(),
        createdAt: now,
        updatedAt: now,
      } as any)
      .returning();
    return result[0];
  }

  async updateStatus(id: string, status: string, paidAt?: Date): Promise<void> {
    await this.db
      .update(invoicesTable)
      .set({ status, paidAt: paidAt?.toISOString(), updatedAt: new Date().toISOString() } as any)
      .where(eq(invoicesTable.id, id));
  }

  async addItem(data: {
    invoiceId: string;
    description: string;
    quantity?: number;
    unitPrice: number;
    total: number;
  }): Promise<InvoiceItem> {
    const result = await this.db
      .insert(invoiceItemsTable)
      .values(data as any)
      .returning();
    return result[0];
  }

  async getItems(invoiceId: string): Promise<InvoiceItem[]> {
    return this.db
      .select()
      .from(invoiceItemsTable)
      .where(eq(invoiceItemsTable.invoiceId, invoiceId));
  }
}