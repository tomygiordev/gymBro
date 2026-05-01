import { Module } from '@nestjs/common';
import { TenantsController } from './presentation/controllers/tenants.controller';
import { TenantsService } from './application/use-cases/tenants.service';
import { TenantsRepository } from './infrastructure/repositories/tenants.repository';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, TenantsRepository],
  exports: [TenantsService],
})
export class TenantsModule {}