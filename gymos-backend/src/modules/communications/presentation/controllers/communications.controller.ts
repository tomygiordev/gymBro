import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunicationsService } from '../../application/use-cases/communications.service';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';

@ApiTags('Communications')
@Controller('communications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send email' })
  async send(@Body() data: { to: string; subject: string; body: string }) {
    return this.communicationsService.sendEmail(data);
  }
}