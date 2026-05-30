import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MembershipsRepository } from '../../infrastructure/repositories/memberships.repository';
import { PlansRepository } from '../../infrastructure/repositories/plans.repository';
import { MEMBERSHIP_STATUS } from '../../../../shared/constants';
import { addDays } from '../../../../shared/utils';
import {
  CreateMembershipDto,
  RenewMembershipDto,
  FreezeMembershipDto,
  MembershipResponseDto,
  PlanDto,
} from '../../presentation/dtos/memberships.dto';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly membershipsRepository: MembershipsRepository,
    private readonly plansRepository: PlansRepository,
  ) {}

  async getActiveMembership(memberId: string) {
    const membership = await this.membershipsRepository.findLatestByMemberId(memberId);
    if (!membership) return null;

    const status = await this.membershipsRepository.getStatus(membership);
    return {
      id: membership.id,
      planId: membership.planId,
      planName: membership.planName,
      status,
      startDate: new Date(membership.startDate),
      endDate: new Date(membership.endDate),
    };
  }

  async getById(id: string): Promise<MembershipResponseDto> {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const status = await this.membershipsRepository.getStatus(membership);

    return {
      id: membership.id,
      memberId: membership.memberId,
      planId: membership.planId,
      planName: membership.planName,
      status,
      startDate: new Date(membership.startDate),
      endDate: new Date(membership.endDate),
      frozeAt: membership.frozeAt ? new Date(membership.frozeAt) : null,
      frozeUntil: membership.frozeUntil ? new Date(membership.frozeUntil) : null,
      autoRenew: Boolean(membership.autoRenew),
    };
  }

  async create(tenantId: string, dto: CreateMembershipDto): Promise<MembershipResponseDto> {
    const plan = await this.plansRepository.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const existingMembership = await this.membershipsRepository.findActiveByMemberId(dto.memberId);
    if (existingMembership) {
      throw new BadRequestException('Member already has an active membership');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = addDays(startDate, plan.durationDays || 30);

    const membership = await this.membershipsRepository.create({
      memberId: dto.memberId,
      planId: dto.planId,
      tenantId,
      startDate,
      endDate,
      autoRenew: dto.autoRenew || false,
    });

    return {
      id: membership.id,
      memberId: membership.memberId,
      planId: membership.planId,
      planName: plan.name,
      status: MEMBERSHIP_STATUS.ACTIVE as 'active',
      startDate: new Date(membership.startDate),
      endDate: new Date(membership.endDate),
      frozeAt: null,
      frozeUntil: null,
      autoRenew: Boolean(membership.autoRenew),
    };
  }

  async renew(id: string, dto: RenewMembershipDto): Promise<MembershipResponseDto> {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const plan = await this.plansRepository.findById(membership.planId);
    const durationDays = dto.durationDays || plan?.durationDays || 30;
    const newEndDate = addDays(new Date(), durationDays);

    await this.membershipsRepository.renew(id, newEndDate);

    return this.getById(id);
  }

  async freeze(id: string, dto: FreezeMembershipDto): Promise<MembershipResponseDto> {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.status === MEMBERSHIP_STATUS.FROZEN) {
      throw new BadRequestException('Membership is already frozen');
    }

    const frozeUntil = dto.freezeDays ? addDays(new Date(), dto.freezeDays) : new Date(dto.freezeUntil!);
    await this.membershipsRepository.freeze(id, frozeUntil, membership.endDate);

    return this.getById(id);
  }

  async unfreeze(id: string): Promise<MembershipResponseDto> {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.status !== MEMBERSHIP_STATUS.FROZEN) {
      throw new BadRequestException('Membership is not frozen');
    }

    await this.membershipsRepository.unfreeze(id);
    return this.getById(id);
  }

  async listPlans(tenantId: string): Promise<PlanDto[]> {
    const plans = await this.plansRepository.findByTenant(tenantId);
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceMonthly: p.priceMonthly,
      currency: p.currency,
      durationDays: p.durationDays,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
      allowsGroupClasses: Boolean(p.allowsGroupClasses),
      groupClassesPerMonth: p.groupClassesPerMonth,
      allowsAllBranches: Boolean(p.allowsAllBranches),
      includesPersonalTraining: Boolean(p.includesPersonalTraining),
      personalTrainingSessions: p.personalTrainingSessions,
    }));
  }

  async createPlan(tenantId: string, dto: PlanDto): Promise<PlanDto> {
    const plan = await this.plansRepository.create({
      tenantId,
      ...dto,
    });
    return { ...dto, id: plan.id };
  }
}
