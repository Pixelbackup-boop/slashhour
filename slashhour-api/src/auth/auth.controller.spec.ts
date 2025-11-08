import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, UserType } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    name: 'Test User',
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockRequest = {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      username: mockUser.username,
    },
  };

  // Type-safe mocks (2025 best practice)
  const mockAuthService: {
    register: jest.Mock;
    login: jest.Mock;
    validateUser: jest.Mock;
    refreshToken: jest.Mock;
  } = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123!',
        name: 'New User',
        userType: UserType.CONSUMER,
      };

      const mockResponse = {
        ...mockTokens,
        user: mockUser,
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with email', async () => {
      const loginDto: LoginDto = {
        emailOrPhone: 'test@example.com',
        password: 'Password123!',
      };

      const mockResponse = {
        ...mockTokens,
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token', async () => {
      const refreshTokenValue = 'old-refresh-token';

      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResponse);

      const result = await controller.refreshToken(refreshTokenValue);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        refreshTokenValue,
      );
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user profile', async () => {
      const result = await controller.getMe(mockRequest as never);

      expect(result).toEqual(mockRequest.user);
    });
  });
});
