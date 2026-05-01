import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './shared/redis/redis.module';
import { BullModule } from './shared/bull/bull.module';
import { IamModule } from './modules/iam/iam.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { BranchesModule } from './modules/branches/branches.module';
import { StaffModule } from './modules/staff/staff.module';
import { MembersModule } from './modules/members/members.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { BillingModule } from './modules/billing/billing.module';
import { CheckinsModule } from './modules/checkins/checkins.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthController } from './common/health/health.controller';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    RedisModule,
    BullModule,
    IamModule,
    TenantsModule,
    BranchesModule,
    StaffModule,
    MembersModule,
    MembershipsModule,
    BillingModule,
    CheckinsModule,
    SchedulingModule,
    CommunicationsModule,
    ReportingModule,
    NotificationsModule,
    AuditModule,
  ],
  controllers: [HealthController],
  exports: [DatabaseModule, RedisModule, BullModule],
})
export class AppModule {}