import { Module, forwardRef } from '@nestjs/common';
import { MembershipsController } from './presentation/controllers/memberships.controller';
import { MembershipsService } from './application/use-cases/memberships.service';
import { MembershipsRepository } from './infrastructure/repositories/memberships.repository';
import { PlansRepository } from './infrastructure/repositories/plans.repository';
import { MembersModule } from '../members/members.module';
import { BillingModule } from '../billing/billing.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => MembersModule),
    forwardRef(() => BillingModule),
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService, MembershipsRepository, PlansRepository],
  exports: [MembershipsService, MembershipsRepository, PlansRepository],
})
export class MembershipsModule {}