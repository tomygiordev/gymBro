import { Injectable } from '@nestjs/common';

@Injectable()
export class CommunicationsService {
  async sendEmail(_data: { to: string; subject: string; body: string }) {
    return { success: true };
  }
}
