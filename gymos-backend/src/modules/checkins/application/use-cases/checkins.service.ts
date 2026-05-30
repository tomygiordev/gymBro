import { Injectable, BadRequestException } from '@nestjs/common';
import { CheckinsRepository } from '../../infrastructure/repositories/checkins.repository';
import { MembersRepository } from '../../../members/infrastructure/repositories/members.repository';
import { MembershipsService } from '../../../memberships/application/use-cases/memberships.service';
import { MEMBERSHIP_STATUS, CHECKIN_RESULT } from '../../../../shared/constants';
import { CreateCheckinDto, CheckinResponseDto, CheckinFeedResponseDto } from '../../presentation/dtos/checkins.dto';

@Injectable()
export class CheckinsService {
  constructor(
    private readonly checkinsRepository: CheckinsRepository,
    private readonly membersRepository: MembersRepository,
    private readonly membershipsService: MembershipsService,
  ) {}

  async checkin(tenantId: string, dto: CreateCheckinDto): Promise<CheckinResponseDto> {
    const memberQuery = dto.memberQuery?.trim();
    if (!memberQuery || memberQuery.length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }

    const searchResults = await this.membersRepository.search(tenantId, memberQuery);

    if (searchResults.length === 0) {
      await this.checkinsRepository.createAttempt({
        memberId: 'unknown',
        branchId: dto.branchId,
        tenantId,
        result: CHECKIN_RESULT.DENIED,
        reason: 'Member not found',
        idempotencyKey: dto.idempotencyKey,
      });

      return {
        success: false,
        result: 'denied',
        memberId: '',
        memberName: '',
        membershipStatus: 'none',
        reason: 'No se encontró ningún socio con ese documento',
        timestamp: new Date(),
      };
    }

    const member = searchResults[0];
    const membership = await this.membershipsService.getActiveMembership(member.id);

    if (!membership) {
      await this.checkinsRepository.createAttempt({
        memberId: member.id,
        branchId: dto.branchId,
        tenantId,
        result: CHECKIN_RESULT.DENIED,
        reason: 'No active membership',
        idempotencyKey: dto.idempotencyKey,
      });

      return {
        success: false,
        result: 'denied',
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        membershipStatus: 'none',
        reason: 'El socio no tiene membresía activa',
        timestamp: new Date(),
      };
    }

    let checkinResult: {
      success: boolean;
      result: 'success' | 'warning' | 'denied';
      memberId: string;
      memberName: string;
      membershipStatus: 'active' | 'warning' | 'expired' | 'frozen';
      membershipPlan?: string;
      membershipEndDate?: Date;
      reason?: string;
      timestamp: Date;
      checkinId?: string;
    };

    switch (membership.status) {
      case MEMBERSHIP_STATUS.ACTIVE:
        checkinResult = {
          success: true,
          result: CHECKIN_RESULT.SUCCESS as 'success' | 'warning' | 'denied',
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          membershipStatus: 'active',
          membershipPlan: membership.planName,
          membershipEndDate: membership.endDate,
          timestamp: new Date(),
        };
        break;

      case MEMBERSHIP_STATUS.WARNING:
        checkinResult = {
          success: true,
          result: CHECKIN_RESULT.WARNING as 'success' | 'warning' | 'denied',
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          membershipStatus: 'warning',
          membershipPlan: membership.planName,
          membershipEndDate: membership.endDate,
          reason: `La membresía vence el ${membership.endDate.toLocaleDateString('es-AR')}`,
          timestamp: new Date(),
        };
        break;

      case MEMBERSHIP_STATUS.EXPIRED:
      case MEMBERSHIP_STATUS.FROZEN:
      default: {
        const deniedReason = membership.status === MEMBERSHIP_STATUS.FROZEN
          ? 'La membresía está congelada'
          : `La membresía venció el ${membership.endDate.toLocaleDateString('es-AR')}`;

        await this.checkinsRepository.createAttempt({
          memberId: member.id,
          branchId: dto.branchId,
          tenantId,
          result: CHECKIN_RESULT.DENIED,
          reason: deniedReason,
          idempotencyKey: dto.idempotencyKey,
        });

        return {
          success: false,
          result: 'denied',
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          membershipStatus: membership.status as 'active' | 'warning' | 'expired' | 'frozen',
          membershipPlan: membership.planName,
          membershipEndDate: membership.endDate,
          reason: deniedReason,
          timestamp: new Date(),
        };
      }
    }

    const checkin = await this.checkinsRepository.createCheckin({
      memberId: member.id,
      membershipId: membership.id,
      branchId: dto.branchId,
      tenantId,
      checkinType: dto.checkinType || 'standard',
      classSessionId: dto.classSessionId,
    });

    checkinResult.checkinId = checkin.id;

    return {
      success: checkinResult.success,
      result: checkinResult.result,
      memberId: checkinResult.memberId,
      memberName: checkinResult.memberName,
      membershipStatus: checkinResult.membershipStatus,
      membershipPlan: checkinResult.membershipPlan,
      membershipEndDate: checkinResult.membershipEndDate,
      reason: checkinResult.reason,
      checkinId: checkinResult.checkinId,
      timestamp: checkinResult.timestamp,
    };
  }

  async getFeed(tenantId: string, limit = 50): Promise<CheckinFeedResponseDto> {
    const items = await this.checkinsRepository.findTodayByTenant(tenantId, limit);
    const totalCount = await this.checkinsRepository.getTodayCount(tenantId);

    return { items, totalCount };
  }

  async getEligibility(memberId: string): Promise<{
    eligible: boolean;
    status: 'active' | 'warning' | 'expired' | 'frozen' | 'none';
    planName?: string;
    endDate?: Date;
    reason?: string;
  }> {
    const membership = await this.membershipsService.getActiveMembership(memberId);

    if (!membership) {
      return {
        eligible: false,
        status: 'none',
        reason: 'No tiene membresía activa',
      };
    }

    return {
      eligible: membership.status === 'active' || membership.status === 'warning',
      status: membership.status,
      planName: membership.planName,
      endDate: membership.endDate,
    };
  }
}
