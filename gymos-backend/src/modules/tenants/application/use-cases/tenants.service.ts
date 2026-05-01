import { Injectable } from '@nestjs/common';
import { TenantsRepository } from '../../infrastructure/repositories/tenants.repository';

@Injectable()
export class TenantsService {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  async getById(id: string) {
    return this.tenantsRepository.findById(id);
  }

  async create(data: { name: string; slug: string; contactEmail: string }) {
    return this.tenantsRepository.create(data);
  }
}