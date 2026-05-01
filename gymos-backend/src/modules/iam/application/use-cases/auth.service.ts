import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, gt, isNull, sql } from 'drizzle-orm';
import { DrizzleInstance } from '../../../../database';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { SessionsRepository } from '../../infrastructure/repositories/sessions.repository';
import { StaffProfilesRepository } from '../../infrastructure/repositories/staff-profiles.repository';
import { PasswordService } from '../../infrastructure/services/password.service';
import { TokenService } from '../../infrastructure/services/token.service';
import { AuditService } from '../../../audit/application/use-cases/audit.service';
import { passwordResetTokensTable } from '../../../../database/schema';
import { LoginDto, AuthResponseDto } from '../../presentation/dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DRIZZLE_INSTANCE') private readonly db: DrizzleInstance,
    private readonly usersRepository: UsersRepository,
    private readonly sessionsRepository: SessionsRepository,
    private readonly staffProfilesRepository: StaffProfilesRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.verify(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const staffProfile = await this.staffProfilesRepository.findByUserId(user.id);
    const tenantId = staffProfile?.tenantId || 'default';
    const branchId = staffProfile?.id;

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      tenantId,
      branchId,
      role: 'staff',
    });

    const { token: refreshToken, hash: refreshTokenHash } =
      this.tokenService.generateRefreshToken(user.id);

    const refreshTtl = this.configService.get('jwt.refreshTokenTtl', '7d');
    const expiresAt = this.calculateExpiry(refreshTtl);

    await this.sessionsRepository.create({
      userId: user.id,
      refreshTokenHash,
      expiresAt,
    });

    await this.auditService.log({
      action: 'auth.login',
      entityType: 'session',
      userId: user.id,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('jwt.accessTokenTtl', '15m'),
      tokenType: 'Bearer',
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);

    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      const sessions = await this.sessionsRepository.findByUserId(payload.sub);
      const session = sessions.find((s) => s.refreshTokenHash === tokenHash);

      if (!session || session.revokedAt) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > new Date(session.expiresAt)) {
        await this.sessionsRepository.revoke(session.id);
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = await this.usersRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      await this.sessionsRepository.revoke(session.id);

      return this.login({
        email: user.email,
        password: '',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findByEmail(email);
    if (user) {
      const { token, hash, expiresAt } = this.tokenService.generatePasswordResetToken();
      const now = new Date().toISOString();

      await this.db.insert(passwordResetTokensTable).values({
        userId: user.id,
        tokenHash: hash,
        expiresAt: expiresAt.toISOString(),
        createdAt: now,
      } as any);

      await this.auditService.log({
        action: 'auth.password_reset_requested',
        entityType: 'password_reset_token',
        userId: user.id,
      });
    }
    return { message: 'If the account exists, a reset email has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = this.tokenService.hashRefreshToken(token);

    const resetTokens = await this.db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.tokenHash, tokenHash),
          isNull(passwordResetTokensTable.usedAt),
          gt(passwordResetTokensTable.expiresAt, new Date().toISOString()),
        ),
      )
      .limit(1);

    if (!resetTokens[0]) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const resetToken = resetTokens[0];

    await this.usersRepository.updatePassword(resetToken.userId, newPassword);

    await this.db
      .update(passwordResetTokensTable)
      .set({ usedAt: new Date().toISOString() } as any)
      .where(eq(passwordResetTokensTable.id, resetToken.id));

    await this.auditService.log({
      action: 'auth.password_reset_completed',
      entityType: 'password_reset_token',
      userId: resetToken.userId,
    });

    return { message: 'Password reset successful' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const staffProfile = await this.staffProfilesRepository.findByUserId(userId);

    return {
      id: user.id,
      email: user.email,
      profile: staffProfile
        ? {
            firstName: staffProfile.firstName,
            lastName: staffProfile.lastName,
            avatarUrl: staffProfile.avatarUrl,
          }
        : null,
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.sessionsRepository.revokeAllForUser(userId);
    await this.auditService.log({
      action: 'auth.logout',
      entityType: 'session',
      userId,
    });
    return { message: 'Logged out successfully' };
  }

  private calculateExpiry(ttl: string): Date {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}