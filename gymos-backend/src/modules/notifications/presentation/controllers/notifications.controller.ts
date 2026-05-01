import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from '../../application/use-cases/notifications.service';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send push notification' })
  async send(@Body() data: { userId: string; title: string; body: string }) {
    return this.notificationsService.sendPush(data.userId, { title: data.title, body: data.body });
  }
}