import { IsString, IsOptional, IsEmail, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateMemberDto {
  @ApiProperty({ example: 'Fernando' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Costas' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'DNI' })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiPropertyOptional({ example: '32145678' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ example: 'fernando@gym.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+5491145678900' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}

export class MemberListItemDto {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
}

export class MemberMembershipSummaryDto {
  id: string;
  planName: string;
  status: 'active' | 'warning' | 'expired' | 'frozen';
  startDate: Date;
  endDate: Date;
}

export class MemberDetailDto {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string | null;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  membership: MemberMembershipSummaryDto | null;
}

export class MemberSearchResultDto {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string | null;
  phone: string | null;
  membershipStatus: 'active' | 'warning' | 'expired' | 'frozen' | 'none';
  membershipPlanName: string | null;
  membershipEndDate: Date | null;
}