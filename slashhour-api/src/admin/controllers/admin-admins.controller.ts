import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminService } from '../services/admin.service';
import { AdminActivityLogService } from '../services/admin-activity-log.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { PaginationDto } from '../dto/query-params.dto';
import { AdminJwtAuthGuard } from '../guards/admin-jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentAdmin } from '../decorators/admin.decorator';
import { admin_role_enum } from '../../../generated/prisma';

@Controller('admin/admins')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
export class AdminAdminsController {
  constructor(
    private adminService: AdminService,
    private activityLogService: AdminActivityLogService,
  ) {}

  @Post()
  @Roles(admin_role_enum.super_admin)
  async create(
    @Body() createDto: CreateAdminDto,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const newAdmin = await this.adminService.createAdmin(createDto, admin.id);

    await this.activityLogService.logActivity(
      admin.id,
      'CREATE_ADMIN',
      'admin',
      newAdmin.id,
      { email: newAdmin.email, role: newAdmin.role },
      req.ip,
      req.headers['user-agent'],
    );

    return newAdmin;
  }

  @Get()
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async findAll(@Query() query: PaginationDto) {
    return this.adminService.findAll(query);
  }

  @Get(':id')
  @Roles(admin_role_enum.super_admin, admin_role_enum.moderator)
  async findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Put(':id')
  @Roles(admin_role_enum.super_admin)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdminDto,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const updated = await this.adminService.update(id, updateDto, admin.id, admin.role);

    await this.activityLogService.logActivity(
      admin.id,
      'UPDATE_ADMIN',
      'admin',
      id,
      updateDto,
      req.ip,
      req.headers['user-agent'],
    );

    return updated;
  }

  @Delete(':id')
  @Roles(admin_role_enum.super_admin)
  async delete(
    @Param('id') id: string,
    @CurrentAdmin() admin: any,
    @Req() req: Request,
  ) {
    const result = await this.adminService.delete(id, admin.id, admin.role);

    await this.activityLogService.logActivity(
      admin.id,
      'DELETE_ADMIN',
      'admin',
      id,
      {},
      req.ip,
      req.headers['user-agent'],
    );

    return result;
  }

  @Get('logs/activity')
  @Roles(admin_role_enum.super_admin)
  async getActivityLogs(@Query() query: PaginationDto) {
    return this.activityLogService.getActivityLogs(query);
  }
}
