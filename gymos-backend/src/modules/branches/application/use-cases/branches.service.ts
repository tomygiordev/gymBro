import { Injectable } from '@nestjs/common';
import { BranchesRepository } from '../../infrastructure/repositories/branches.repository';

@Injectable()
export class BranchesService {
  constructor(private readonly branchesRepository: BranchesRepository) {}

  async list(tenantId: string) {
    return this.branchesRepository.findByTenant(tenantId);
  }

  async getById(id: string) {
    return this.branchesRepository.findById(id);
  }

  async create(tenantId: string, data: { name: string; address?: string; phone?: string }) {
    return this.branchesRepository.create({ tenantId, ...data });
  }
}
