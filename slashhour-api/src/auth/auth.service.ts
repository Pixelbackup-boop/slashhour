import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password, name, userType, username } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
      userType,
      username,
    });

    await this.usersRepository.save(user);

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
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :emailOrPhone', { emailOrPhone })
      .orWhere('user.phone = :emailOrPhone', { emailOrPhone })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Your email or password is wrong, please check');
    }

    // Verify password
    if (!user.password) {
      throw new UnauthorizedException('Your email or password is wrong, please check');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Your email or password is wrong, please check');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
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
