import { Injectable } from '@nestjs/common';

@Injectable()
export class StaffService {
  async list(tenantId: string) {
    return [];
  }

  async getById(id: string) {
    return null;
  }
}