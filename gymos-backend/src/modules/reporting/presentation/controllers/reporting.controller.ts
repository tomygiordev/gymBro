import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportingService } from '../../application/use-cases/reporting.service';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../../../common/decorators/request.decorators';

@ApiTags('Dashboard')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  async getDashboard(@TenantId() tenantId: string) {
    return this.reportingService.getDashboard(tenantId);
  }

  @Get('members-stats')
  @ApiOperation({ summary: 'Get member statistics' })
  async getMembersStats(@TenantId() tenantId: string) {
    return this.reportingService.getMembersStats(tenantId);
  }
}