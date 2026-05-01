import { Module } from '@nestjs/common';
import { MembersController } from './presentation/controllers/members.controller';
import { MembersService } from './application/use-cases/members.service';
import { MembersRepository } from './infrastructure/repositories/members.repository';
import { MembershipsModule } from '../memberships/memberships.module';
import { DatabaseModule } from '../../database/database.module';
import { CheckinsRepository } from '../checkins/infrastructure/repositories/checkins.repository';

@Module({
  imports: [DatabaseModule, MembershipsModule],
  controllers: [MembersController],
  providers: [MembersService, MembersRepository, CheckinsRepository],
  exports: [MembersService, MembersRepository],
})
export class MembersModule {}
