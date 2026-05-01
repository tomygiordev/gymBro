import { Module } from '@nestjs/common';
import { CheckinsController } from './presentation/controllers/checkins.controller';
import { CheckinsService } from './application/use-cases/checkins.service';
import { CheckinsRepository } from './infrastructure/repositories/checkins.repository';
import { MembersModule } from '../members/members.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, MembersModule, MembershipsModule],
  controllers: [CheckinsController],
  providers: [CheckinsService, CheckinsRepository],
  exports: [CheckinsService],
})
export class CheckinsModule {}