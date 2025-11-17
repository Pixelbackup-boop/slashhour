import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../dto/query-params.dto';

@Injectable()
export class AdminActivityLogService {
  constructor(private prisma: PrismaService) {}

  async logActivity(
    adminId: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.admin_activity_logs.create({
      data: {
        admin_id: adminId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });
  }

  async getActivityLogs(query: PaginationDto, adminId?: string) {
    const { page = 1, limit = 50, sortBy = 'created_at', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = adminId ? { admin_id: adminId } : {};

    const [logs, total] = await Promise.all([
      this.prisma.admin_activity_logs.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.admin_activity_logs.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
