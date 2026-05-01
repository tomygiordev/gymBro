import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from '../../infrastructure/repositories/invoices.repository';
import { PaymentsRepository } from '../../infrastructure/repositories/payments.repository';
import { generateInvoiceNumber } from '../../../../shared/utils';

@Injectable()
export class BillingService {
  constructor(
    private readonly invoicesRepository: InvoicesRepository,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  async createInvoice(data: {
    memberId: string;
    membershipId?: string;
    tenantId: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
    dueDate?: Date;
    paymentMethod?: string;
  }) {
    const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const invoiceNumber = generateInvoiceNumber(data.tenantId, Date.now());

    const invoice = await this.invoicesRepository.create({
      memberId: data.memberId,
      membershipId: data.membershipId,
      tenantId: data.tenantId,
      invoiceNumber,
      subtotal,
      discount: 0,
      total: subtotal,
      dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      paymentMethod: data.paymentMethod,
    });

    for (const item of data.items) {
      await this.invoicesRepository.addItem({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.unitPrice * item.quantity,
      });
    }

    return invoice;
  }

  async registerPayment(data: {
    invoiceId?: string;
    memberId: string;
    tenantId: string;
    amount: number;
    method: string;
    transactionRef?: string;
  }) {
    const payment = await this.paymentsRepository.create({
      ...data,
      status: 'completed',
    });

    if (data.invoiceId) {
      await this.invoicesRepository.updateStatus(data.invoiceId, 'paid', new Date());
    }

    return payment;
  }

  async getMemberInvoices(memberId: string) {
    return this.invoicesRepository.findByMemberId(memberId);
  }

  async getMemberPayments(memberId: string) {
    return this.paymentsRepository.findByMemberId(memberId);
  }
}