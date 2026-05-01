import { Module } from '@nestjs/common';
import { BranchesController } from './presentation/controllers/branches.controller';
import { BranchesService } from './application/use-cases/branches.service';
import { BranchesRepository } from './infrastructure/repositories/branches.repository';

@Module({
  controllers: [BranchesController],
  providers: [BranchesService, BranchesRepository],
  exports: [BranchesService],
})
export class BranchesModule {}