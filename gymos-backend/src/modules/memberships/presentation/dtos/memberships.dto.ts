import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMembershipDto {
  @ApiProperty()
  @IsString()
  memberId: string;

  @ApiProperty()
  @IsString()
  planId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}

export class RenewMembershipDto {
  @ApiPropertyOptional({ description: 'Duration in days' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  durationDays?: number;
}

export class FreezeMembershipDto {
  @ApiPropertyOptional({ description: 'Number of days to freeze' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  freezeDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  freezeUntil?: string;
}

export class MembershipResponseDto {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  status: 'active' | 'warning' | 'expired' | 'frozen';
  startDate: Date;
  endDate: Date;
  frozeAt: Date | null;
  frozeUntil: Date | null;
  autoRenew: boolean;
}

export class PlanDto {
  id?: string;
  name: string;
  description?: string;
  priceMonthly: number;
  currency?: string;
  durationDays?: number;
  features?: string[];
  allowsGroupClasses?: boolean;
  groupClassesPerMonth?: number;
  allowsAllBranches?: boolean;
  includesPersonalTraining?: boolean;
  personalTrainingSessions?: number;
  sortOrder?: number;
}