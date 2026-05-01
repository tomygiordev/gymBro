import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/use-cases/auth.service';
import { JwtStrategy } from './infrastructure/guards/jwt.strategy';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { PasswordService } from './infrastructure/services/password.service';
import { TokenService } from './infrastructure/services/token.service';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { SessionsRepository } from './infrastructure/repositories/sessions.repository';
import { StaffProfilesRepository } from './infrastructure/repositories/staff-profiles.repository';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: {
          expiresIn: config.get('jwt.accessTokenTtl', '15m'),
        },
      }),
    }),
    DatabaseModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    PasswordService,
    TokenService,
    UsersRepository,
    SessionsRepository,
    StaffProfilesRepository,
  ],
  exports: [AuthService, PasswordService, TokenService],
})
export class IamModule {}