import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SchedulingService } from '../../application/use-cases/scheduling.service';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../../../common/decorators/request.decorators';

@ApiTags('Scheduling')
@Controller('class-sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Get()
  @ApiOperation({ summary: 'List class sessions' })
  async list(@TenantId() tenantId: string, @Query('date') date?: string) {
    return this.schedulingService.listClasses(tenantId, date);
  }

  @Post()
  @ApiOperation({ summary: 'Create a class session' })
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.schedulingService.createClass(tenantId, data);
  }

  @Post(':id/reservations')
  @ApiOperation({ summary: 'Reserve a spot in a class' })
  async reserve(@Param('id') classSessionId: string, @Body() data: { memberId: string }) {
    return this.schedulingService.reserve(classSessionId, data.memberId);
  }

  @Get(':id/waitlist')
  @ApiOperation({ summary: 'Get waitlist for a class' })
  async getWaitlist(@Param('id') classSessionId: string) {
    return this.schedulingService.getWaitlist(classSessionId);
  }
}
