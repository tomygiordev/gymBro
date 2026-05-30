import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendPush(_userId: string, _notification: { title: string; body: string }) {
    return { success: true };
  }
}
