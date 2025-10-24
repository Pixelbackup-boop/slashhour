import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Transform Prisma user (snake_case) to User entity (camelCase)
   */
  private transformPrismaUser(prismaUser: any): User {
    const { user_type, ...rest } = prismaUser;
    return {
      ...rest,
      userType: user_type,
    } as User;
  }

  async register(registerDto: RegisterDto) {
    const { email, phone, password, name, userType, username } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.users.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
          ...(username ? [{ username }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const prismaUser = await this.prisma.users.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        user_type: userType,
        username: username || email?.split('@')[0] || `user_${Date.now()}`,
      },
    });

    const user = this.transformPrismaUser(prismaUser);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { emailOrPhone, password } = loginDto;

    // Find user by email or phone
    const prismaUser = await this.prisma.users.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone },
        ],
      },
    });

    if (!prismaUser) {
      throw new UnauthorizedException('Your email or password is wrong, please check');
    }

    // Verify password
    if (!prismaUser.password) {
      throw new UnauthorizedException('Your email or password is wrong, please check');
    }
    const isPasswordValid = await bcrypt.compare(password, prismaUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Your email or password is wrong, please check');
    }

    const user = this.transformPrismaUser(prismaUser);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const prismaUser = await this.prisma.users.findUnique({
      where: { id: userId },
    });
    if (!prismaUser) {
      throw new UnauthorizedException('User not found');
    }
    return this.transformPrismaUser(prismaUser);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
      });

      const user = await this.validateUser(payload.sub);
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      userType: user.userType,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
        expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '30d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
