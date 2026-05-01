import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'crypto';
import { AuthPayload, RefreshTokenPayload } from '../../../../shared/types';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: {
    sub: string;
    email: string;
    tenantId: string;
    branchId?: string;
    role: string;
  }): string {
    return this.jwtService.sign(payload as AuthPayload);
  }

  generateRefreshToken(userId: string): { token: string; hash: string } {
    const rawToken = uuidv4();
    const hash = createHash('sha256').update(rawToken).digest('hex');
    return { token: rawToken, hash };
  }

  verifyAccessToken(token: string): AuthPayload {
    return this.jwtService.verify(token);
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwtService.verify(token, {
      secret: this.configService.get('jwt.secret'),
    });
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  generatePasswordResetToken(): { token: string; hash: string; expiresAt: Date } {
    const token = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    return { token, hash, expiresAt };
  }
}