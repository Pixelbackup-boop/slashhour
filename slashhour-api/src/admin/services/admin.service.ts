import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { PaginationDto } from '../dto/query-params.dto';
import * as bcrypt from 'bcrypt';
import { admin_role_enum } from '../../../generated/prisma';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createAdmin(createDto: CreateAdminDto, creatorId: string) {
    // Check if email or username already exists
    const existing = await this.prisma.admins.findFirst({
      where: {
        OR: [
          { email: createDto.email },
          { username: createDto.username },
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    // Create admin
    const admin = await this.prisma.admins.create({
      data: {
        email: createDto.email,
        username: createDto.username,
        password: hashedPassword,
        name: createDto.name,
        role: createDto.role || admin_role_enum.moderator,
        permissions: createDto.permissions || [],
        created_by: creatorId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        permissions: true,
        is_active: true,
        created_at: true,
      },
    });

    return admin;
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 20, search, sortBy = 'created_at', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [admins, total] = await Promise.all([
      this.prisma.admins.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          permissions: true,
          is_active: true,
          last_login_at: true,
          created_at: true,
          updated_at: true,
        },
      }),
      this.prisma.admins.count({ where }),
    ]);

    return {
      data: admins,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const admin = await this.prisma.admins.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        permissions: true,
        is_active: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
        created_by: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async update(id: string, updateDto: UpdateAdminDto, requestingAdminId: string, requestingAdminRole: admin_role_enum) {
    const admin = await this.findOne(id);

    // Prevent non-super-admins from updating super admins
    if (admin.role === admin_role_enum.super_admin && requestingAdminRole !== admin_role_enum.super_admin) {
      throw new ForbiddenException('Only super admins can update super admin accounts');
    }

    // Prevent admins from changing their own role
    if (id === requestingAdminId && updateDto.role && updateDto.role !== admin.role) {
      throw new ForbiddenException('You cannot change your own role');
    }

    // Check email uniqueness if being updated
    if (updateDto.email && updateDto.email !== admin.email) {
      const existing = await this.prisma.admins.findUnique({
        where: { email: updateDto.email },
      });

      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    const updated = await this.prisma.admins.update({
      where: { id },
      data: {
        ...updateDto,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        permissions: true,
        is_active: true,
        updated_at: true,
      },
    });

    return updated;
  }

  async delete(id: string, requestingAdminId: string, requestingAdminRole: admin_role_enum) {
    const admin = await this.findOne(id);

    // Prevent self-deletion
    if (id === requestingAdminId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    // Prevent non-super-admins from deleting super admins
    if (admin.role === admin_role_enum.super_admin && requestingAdminRole !== admin_role_enum.super_admin) {
      throw new ForbiddenException('Only super admins can delete super admin accounts');
    }

    await this.prisma.admins.delete({
      where: { id },
    });

    return { message: 'Admin deleted successfully' };
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const admin = await this.prisma.admins.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isValid) {
      throw new ForbiddenException('Invalid current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.admins.update({
      where: { id },
      data: { password: hashedPassword, updated_at: new Date() },
    });

    return { message: 'Password changed successfully' };
  }
}
