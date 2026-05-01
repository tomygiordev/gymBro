import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from '../../application/use-cases/tenants.service';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async getById(@Param('id') id: string) {
    return this.tenantsService.getById(id);
  }
}