import { Module } from '@nestjs/common';
import { CommunicationsController } from './presentation/controllers/communications.controller';
import { CommunicationsService } from './application/use-cases/communications.service';

@Module({
  controllers: [CommunicationsController],
  providers: [CommunicationsService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}