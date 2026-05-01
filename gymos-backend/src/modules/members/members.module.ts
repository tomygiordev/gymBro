import { Module } from '@nestjs/common';
import { MembersController } from './presentation/controllers/members.controller';
import { MembersService } from './application/use-cases/members.service';
import { MembersRepository } from './infrastructure/repositories/members.repository';
import { MembershipsModule } from '../memberships/memberships.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, MembershipsModule],
  controllers: [MembersController],
  providers: [MembersService, MembersRepository],
  exports: [MembersService, MembersRepository],
})
export class MembersModule {}