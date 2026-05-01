import { Module, forwardRef } from '@nestjs/common';
import { BillingController } from './presentation/controllers/billing.controller';
import { BillingService } from './application/use-cases/billing.service';
import { InvoicesRepository } from './infrastructure/repositories/invoices.repository';
import { PaymentsRepository } from './infrastructure/repositories/payments.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BillingController],
  providers: [BillingService, InvoicesRepository, PaymentsRepository],
  exports: [BillingService, InvoicesRepository],
})
export class BillingModule {}