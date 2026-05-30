import { Module } from '@nestjs/common';
import { StaffController } from './presentation/controllers/staff.controller';
import { StaffService } from './application/use-cases/staff.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
