import { Body, Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CheckinsService } from '../../application/use-cases/checkins.service';
import { CreateCheckinDto, CheckinResponseDto } from '../dtos/checkins.dto';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../../../common/decorators/request.decorators';

@ApiTags('Check-ins')
@Controller('checkins')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Post()
  @ApiOperation({ summary: 'Check-in a member (critical flow)' })
  async checkin(@TenantId() tenantId: string, @Body() dto: CreateCheckinDto): Promise<CheckinResponseDto> {
    return this.checkinsService.checkin(tenantId, dto);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get today check-in feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(@TenantId() tenantId: string, @Query('limit') limit?: string) {
    return this.checkinsService.getFeed(tenantId, parseInt(limit || '50', 10));
  }

  @Get('eligibility/:memberId')
  @ApiOperation({ summary: 'Check member eligibility for check-in' })
  async getEligibility(@Param('memberId') memberId: string) {
    return this.checkinsService.getEligibility(memberId);
  }
}