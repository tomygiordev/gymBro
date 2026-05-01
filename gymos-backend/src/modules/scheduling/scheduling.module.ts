import { Module } from '@nestjs/common';
import { SchedulingController } from './presentation/controllers/scheduling.controller';
import { SchedulingService } from './application/use-cases/scheduling.service';

@Module({
  controllers: [SchedulingController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}