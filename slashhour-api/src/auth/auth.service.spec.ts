import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService - Critical Paths', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRATION: '15m',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRATION: '30d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new consumer user', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        name: 'Test User',
        userType: 'consumer' as const,
      };

      mockPrismaService.users.findFirst.mockResolvedValue(null);
      mockPrismaService.users.create.mockResolvedValue({
        id: 'user-123',
        email: registerDto.email,
        username: registerDto.username,
        name: registerDto.name,
        user_type: registerDto.userType,
        password: 'hashed-password',
        created_at: new Date(),
      });
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(mockPrismaService.users.create).toHaveBeenCalled();
    });

    it('should reject registration with duplicate email', async () => {
      const registerDto = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'Password123!',
        name: 'Test User',
        userType: 'consumer' as const,
      };

      mockPrismaService.users.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should reject registration with duplicate username', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'existinguser',
        password: 'Password123!',
        name: 'Test User',
        userType: 'consumer' as const,
      };

      mockPrismaService.users.findFirst.mockResolvedValue({
        id: 'existing-user',
        username: registerDto.username,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should normalize email to lowercase during registration', async () => {
      const registerDto = {
        email: 'Test@Example.COM',
        username: 'testuser',
        password: 'Password123!',
        name: 'Test User',
        userType: 'consumer' as const,
      };

      mockPrismaService.users.findFirst.mockResolvedValue(null);
      mockPrismaService.users.create.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com', // Should be lowercase
        username: registerDto.username,
        name: registerDto.name,
        user_type: registerDto.userType,
        password: 'hashed-password',
        created_at: new Date(),
      });
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      await service.register(registerDto);

      // Verify that the email was normalized to lowercase
      expect(mockPrismaService.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
        }),
      });
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        emailOrPhone: 'test@example.com',
        password: 'Password123!',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        user_type: 'consumer',
      };

      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should reject login with invalid credentials', async () => {
      const loginDto = {
        emailOrPhone: 'test@example.com',
        password: 'WrongPassword!',
      };

      const hashedPassword = await bcrypt.hash('CorrectPassword!', 10);
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        password: hashedPassword,
      };

      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject login for non-existent user', async () => {
      const loginDto = {
        emailOrPhone: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockPrismaService.users.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow login with any email case (case-insensitive)', async () => {
      const loginDto = {
        emailOrPhone: 'TEST@EXAMPLE.COM', // Uppercase
        password: 'Password123!',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com', // Stored as lowercase
        username: 'testuser',
        password: hashedPassword,
        user_type: 'consumer',
      };

      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      // Verify the query was made with lowercase email
      expect(mockPrismaService.users.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'test@example.com' },
            { phone: 'TEST@EXAMPLE.COM' },
          ],
        },
      });
    });
  });

  describe('validateUser', () => {
    it('should return user for valid user ID', async () => {
      const userId = 'user-123';

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        user_type: 'consumer',
      };

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(result).toHaveProperty('id', userId);
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw UnauthorizedException for invalid user ID', async () => {
      const userId = 'invalid-user-id';

      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(userId)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
