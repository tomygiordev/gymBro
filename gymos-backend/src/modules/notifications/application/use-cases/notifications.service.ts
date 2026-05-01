import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendPush(userId: string, notification: { title: string; body: string }) {
    return { success: true };
  }
}