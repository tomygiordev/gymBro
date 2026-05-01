import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BranchesService } from '../../application/use-cases/branches.service';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../../../common/decorators/request.decorators';

@ApiTags('Branches')
@Controller('branches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'List branches for tenant' })
  async list(@TenantId() tenantId: string) {
    return this.branchesService.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new branch' })
  async create(@TenantId() tenantId: string, @Body() data: { name: string; address?: string; phone?: string }) {
    return this.branchesService.create(tenantId, data);
  }
}