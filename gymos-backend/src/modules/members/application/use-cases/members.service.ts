import { Injectable, NotFoundException } from '@nestjs/common';
import { MembersRepository, MemberSearchResult } from '../../infrastructure/repositories/members.repository';
import { MembershipsService } from '../../../memberships/application/use-cases/memberships.service';
import { CheckinsRepository } from '../../../checkins/infrastructure/repositories/checkins.repository';
import { CreateMemberDto, UpdateMemberDto, MemberListItemDto, MemberDetailDto } from '../../presentation/dtos/members.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly membershipsService: MembershipsService,
    private readonly checkinsRepository: CheckinsRepository,
  ) {}

  async search(tenantId: string, query: string): Promise<MemberSearchResult[]> {
    const results = await this.membersRepository.search(tenantId, query);

    for (const member of results) {
      const membership = await this.membershipsService.getActiveMembership(member.id);
      if (membership) {
        member.membershipStatus = membership.status;
        member.membershipPlanName = membership.planName;
        member.membershipEndDate = membership.endDate;
      }
    }

    return results;
  }

  async findById(id: string): Promise<MemberDetailDto> {
    const member = await this.membersRepository.findById(id);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const membership = await this.membershipsService.getActiveMembership(id);

    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      documentType: member.documentType,
      documentNumber: member.documentNumber,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : null,
      address: member.address,
      emergencyContactName: member.emergencyContactName,
      emergencyContactPhone: member.emergencyContactPhone,
      notes: member.notes,
      photoUrl: member.photoUrl,
      isActive: Boolean(member.isActive),
      createdAt: new Date(member.createdAt),
      lastCheckinAt: null,
      membership: membership
        ? {
            id: membership.id,
            planName: membership.planName,
            status: membership.status,
            startDate: membership.startDate,
            endDate: membership.endDate,
          }
        : null,
    };
  }

  async list(tenantId: string, limit = 50, cursor?: string): Promise<{ members: MemberListItemDto[]; nextCursor?: string }> {
    const members = await this.membersRepository.findByTenant(tenantId, limit + 1, cursor);
    
    let nextCursor: string | undefined;
    if (members.length > limit) {
      const next = members.pop();
      nextCursor = next?.id;
    }

    const memberList: MemberListItemDto[] = members.map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      documentNumber: m.documentNumber,
      email: m.email,
      phone: m.phone,
      isActive: Boolean(m.isActive),
      createdAt: new Date(m.createdAt),
    }));

    const latestCheckins = await this.checkinsRepository.findLatestByMemberIds(
      memberList.map((member) => member.id),
    );

    for (const member of memberList) {
      const membership = await this.membershipsService.getActiveMembership(member.id);
      member.membershipStatus = membership?.status || 'none';
      member.membershipPlanName = membership?.planName || null;
      member.membershipEndDate = membership?.endDate || null;
      member.lastCheckinAt = latestCheckins[member.id]
        ? new Date(latestCheckins[member.id])
        : null;
    }

    return { members: memberList, nextCursor };
  }

  async create(tenantId: string, dto: CreateMemberDto): Promise<{ id: string }> {
    const member = await this.membersRepository.create({
      tenantId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      email: dto.email,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      address: dto.address,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactPhone: dto.emergencyContactPhone,
      notes: dto.notes,
    });
    return { id: member.id };
  }

  async update(id: string, dto: UpdateMemberDto): Promise<{ id: string }> {
    const updateData: Parameters<typeof this.membersRepository.update>[1] = {};
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.documentType !== undefined) updateData.documentType = dto.documentType;
    if (dto.documentNumber !== undefined) updateData.documentNumber = dto.documentNumber;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.emergencyContactName !== undefined) updateData.emergencyContactName = dto.emergencyContactName;
    if (dto.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = dto.emergencyContactPhone;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    const member = await this.membersRepository.update(id, updateData);
    return { id: member.id };
  }

  async delete(id: string): Promise<void> {
    await this.membersRepository.softDelete(id);
  }
}
