import { Module } from '@nestjs/common';
import { StaffController } from './presentation/controllers/staff.controller';
import { StaffService } from './application/use-cases/staff.service';

@Module({
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}