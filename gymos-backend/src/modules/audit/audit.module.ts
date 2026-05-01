import { Module } from '@nestjs/common';
import { AuditController } from './presentation/controllers/audit.controller';
import { AuditService } from './application/use-cases/audit.service';
import { AuditLogsRepository } from './infrastructure/repositories/audit-logs.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditController],
  providers: [AuditService, AuditLogsRepository],
  exports: [AuditService],
})
export class AuditModule {}