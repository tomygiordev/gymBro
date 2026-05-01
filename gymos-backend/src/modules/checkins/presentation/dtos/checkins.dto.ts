import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckinDto {
  @ApiProperty({ description: 'Member search query (name, document or phone)' })
  @IsString()
  memberQuery: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Type: standard, class, visitor' })
  @IsOptional()
  @IsString()
  checkinType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  classSessionId?: string;

  @ApiPropertyOptional({ description: 'For idempotency' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class CheckinResponseDto {
  success: boolean;
  result: 'success' | 'warning' | 'denied';
  memberId: string;
  memberName: string;
  membershipStatus: 'active' | 'warning' | 'expired' | 'frozen' | 'none';
  membershipPlan?: string;
  membershipEndDate?: Date;
  reason?: string;
  checkinId?: string;
  timestamp: Date;
}

export class CheckinFeedItemDto {
  id: string;
  time: string;
  memberId: string;
  memberName: string;
  checkinType: string;
  status: 'success' | 'warning' | 'denied';
}

export class CheckinFeedResponseDto {
  items: CheckinFeedItemDto[];
  totalCount: number;
}