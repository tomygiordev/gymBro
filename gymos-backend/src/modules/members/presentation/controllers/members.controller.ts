import { Body, Controller, Get, Post, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MembersService } from '../../application/use-cases/members.service';
import { CreateMemberDto, UpdateMemberDto } from '../dtos/members.dto';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../../../common/decorators/request.decorators';

@ApiTags('Members')
@Controller('members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search members by name, document or phone' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  async search(@TenantId() tenantId: string, @Query('q') query: string) {
    if (!query || query.length < 2) {
      return [];
    }
    return this.membersService.search(tenantId, query);
  }

  @Get()
  @ApiOperation({ summary: 'List all members for tenant' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  async list(
    @TenantId() tenantId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.membersService.list(tenantId, parseInt(limit || '50', 10), cursor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member details' })
  async getById(@Param('id') id: string) {
    return this.membersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new member' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateMemberDto) {
    return this.membersService.create(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a member' })
  async update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a member' })
  async delete(@Param('id') id: string) {
    await this.membersService.delete(id);
    return { success: true };
  }
}