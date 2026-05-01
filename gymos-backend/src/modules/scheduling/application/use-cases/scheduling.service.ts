import { Injectable } from '@nestjs/common';

@Injectable()
export class SchedulingService {
  async listClasses(tenantId: string, date?: string) {
    return [];
  }

  async createClass(data: any) {
    return { id: '' };
  }

  async reserve(classSessionId: string, memberId: string) {
    return { id: '', status: 'confirmed' };
  }

  async getWaitlist(classSessionId: string) {
    return [];
  }
}