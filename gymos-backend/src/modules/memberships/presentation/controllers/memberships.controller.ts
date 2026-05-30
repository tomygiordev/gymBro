import { Body, Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembershipsService } from '../../application/use-cases/memberships.service';
import { CreateMembershipDto, RenewMembershipDto, FreezeMembershipDto, PlanDto } from '../dtos/memberships.dto';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../../../common/decorators/request.decorators';

@ApiTags('Memberships')
@Controller('memberships')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List all plans for tenant' })
  async listPlans(@TenantId() tenantId: string) {
    return this.membershipsService.listPlans(tenantId);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a new plan' })
  async createPlan(@TenantId() tenantId: string, @Body() dto: PlanDto) {
    return this.membershipsService.createPlan(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get membership by ID' })
  async getById(@Param('id') id: string) {
    return this.membershipsService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new membership' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateMembershipDto) {
    return this.membershipsService.create(tenantId, dto);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew a membership' })
  async renew(@Param('id') id: string, @Body() dto: RenewMembershipDto) {
    return this.membershipsService.renew(id, dto);
  }

  @Post(':id/freeze')
  @ApiOperation({ summary: 'Freeze a membership' })
  async freeze(@Param('id') id: string, @Body() dto: FreezeMembershipDto) {
    return this.membershipsService.freeze(id, dto);
  }

  @Post(':id/unfreeze')
  @ApiOperation({ summary: 'Unfreeze a membership' })
  async unfreeze(@Param('id') id: string) {
    return this.membershipsService.unfreeze(id);
  }
}
