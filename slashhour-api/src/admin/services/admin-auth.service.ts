import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginAdminDto } from '../dto/login-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginAdminDto) {
    const { emailOrUsername, password } = loginDto;

    // Find admin by email or username
    const admin = await this.prisma.admins.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.admins.update({
      where: { id: admin.id },
      data: { last_login_at: new Date() },
    });

    // Generate JWT token
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin' // Distinguish from regular user tokens
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
      },
    };
  }

  async validateAdmin(adminId: string) {
    const admin = await this.prisma.admins.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        permissions: true,
        is_active: true,
      },
    });

    if (!admin || !admin.is_active) {
      return null;
    }

    return admin;
  }
}
