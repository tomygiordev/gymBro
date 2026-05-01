import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BillingService } from '../../application/use-cases/billing.service';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../../../common/decorators/request.decorators';

@ApiTags('Billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices/:memberId')
  @ApiOperation({ summary: 'Get invoices for a member' })
  async getMemberInvoices(@Param('memberId') memberId: string) {
    return this.billingService.getMemberInvoices(memberId);
  }

  @Get('payments/:memberId')
  @ApiOperation({ summary: 'Get payments for a member' })
  async getMemberPayments(@Param('memberId') memberId: string) {
    return this.billingService.getMemberPayments(memberId);
  }
}