import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportingService {
  async getDashboard(tenantId: string) {
    return {
      revenue: { current: 4230000, previous: 3760000, change: 12.4 },
      activeMembers: { current: 2840, newThisWeek: 38 },
      retentionRate: { current: 98.4, previous: 97.6, change: 0.8 },
      occupancyRate: { current: 74, previous: 77, change: -3 },
      checkinsLast7Days: [312, 345, 298, 367, 412, 389, 347],
    };
  }

  async getMembersStats(tenantId: string) {
    return { total: 2840, active: 2650, expired: 150, frozen: 40 };
  }
}