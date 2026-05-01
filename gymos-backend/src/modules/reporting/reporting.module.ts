import { Module } from '@nestjs/common';
import { ReportingController } from './presentation/controllers/reporting.controller';
import { ReportingService } from './application/use-cases/reporting.service';

@Module({
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}