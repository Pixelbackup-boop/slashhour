import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePhoneDto } from './dto/change-phone.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUserId = 'user-123';

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    phone: '+1234567890',
    name: 'Test User',
    userType: 'consumer',
    avatar_url: null,
    email_verified: false,
    phone_verified: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRequest = {
    user: {
      id: mockUserId,
      sub: mockUserId,
      email: 'test@example.com',
      username: 'testuser',
    },
  };

  // Type-safe mocks (2025 best practice)
  const mockUsersService: {
    findById: jest.Mock;
    updateProfile: jest.Mock;
    uploadAvatar: jest.Mock;
    getUserStats: jest.Mock;
    changePassword: jest.Mock;
    changeEmail: jest.Mock;
    changePhone: jest.Mock;
    sendEmailVerification: jest.Mock;
    verifyEmailCode: jest.Mock;
    sendPhoneVerification: jest.Mock;
    verifyPhoneCode: jest.Mock;
    deactivateAccount: jest.Mock;
    scheduleDeletion: jest.Mock;
    cancelDeletion: jest.Mock;
  } = {
    findById: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    getUserStats: jest.fn(),
    changePassword: jest.fn(),
    changeEmail: jest.fn(),
    changePhone: jest.fn(),
    sendEmailVerification: jest.fn(),
    verifyEmailCode: jest.fn(),
    sendPhoneVerification: jest.fn(),
    verifyPhoneCode: jest.fn(),
    deactivateAccount: jest.fn(),
    scheduleDeletion: jest.fn(),
    cancelDeletion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/profile', () => {
    it('should return current user profile', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest as never);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('PATCH /users/profile', () => {
    it('should update user profile', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      const updatedUser = {
        ...mockUser,
        name: updateDto.name,
        bio: updateDto.bio,
      };

      mockUsersService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(
        mockRequest as never,
        updateDto,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        mockUserId,
        updateDto,
      );
    });
  });

  describe('POST /users/profile/avatar', () => {
    it('should upload avatar', async () => {
      const mockFile = {
        fieldname: 'avatar',
        originalname: 'avatar.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('fake-image'),
        size: 1024,
      } as Express.Multer.File;

      const userWithAvatar = {
        ...mockUser,
        avatar_url: 'data:image/jpeg;base64,ZmFrZS1pbWFnZQ==',
        password: 'hashed-password',
      };

      mockUsersService.uploadAvatar.mockResolvedValue(userWithAvatar);

      const result = await controller.uploadAvatar(
        mockRequest as never,
        mockFile,
      );

      expect(result.message).toBe('Avatar uploaded successfully');
      expect(result.user).toBeDefined();
      expect(result.user.password).toBeUndefined();
      expect(mockUsersService.uploadAvatar).toHaveBeenCalledWith(
        mockUserId,
        mockFile,
      );
    });
  });

  describe('GET /users/profile/stats', () => {
    it('should return user statistics', async () => {
      const mockStats = {
        totalSavings: 150.5,
        totalRedemptions: 10,
        dealsSaved: 5,
        businessesFollowed: 3,
        reviewsWritten: 2,
        averageRating: 4.5,
      };

      mockUsersService.getUserStats.mockResolvedValue(mockStats);

      const result = await controller.getUserStats(mockRequest as never);

      expect(result).toEqual(mockStats);
      expect(mockUsersService.getUserStats).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('POST /users/profile/password', () => {
    it('should change password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      };

      mockUsersService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(
        mockRequest as never,
        changePasswordDto,
      );

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(mockUsersService.changePassword).toHaveBeenCalledWith(
        mockUserId,
        changePasswordDto,
      );
    });
  });

  describe('POST /users/profile/email', () => {
    it('should change email', async () => {
      const changeEmailDto: ChangeEmailDto = {
        newEmail: 'newemail@example.com',
      };

      const updatedUser = {
        ...mockUser,
        email: changeEmailDto.newEmail,
        email_verified: false,
        password: 'hashed-password',
      };

      mockUsersService.changeEmail.mockResolvedValue(updatedUser);

      const result = await controller.changeEmail(
        mockRequest as never,
        changeEmailDto,
      );

      expect(result.message).toBe(
        'Email updated successfully. Verification email sent.',
      );
      expect(result.user.email).toBe(changeEmailDto.newEmail);
      expect(result.user.password).toBeUndefined();
      expect(mockUsersService.changeEmail).toHaveBeenCalledWith(
        mockUserId,
        changeEmailDto,
      );
    });
  });

  describe('POST /users/profile/phone', () => {
    it('should change phone', async () => {
      const changePhoneDto: ChangePhoneDto = {
        newPhone: '+0987654321',
      };

      const updatedUser = {
        ...mockUser,
        phone: changePhoneDto.newPhone,
        phone_verified: false,
        password: 'hashed-password',
      };

      mockUsersService.changePhone.mockResolvedValue(updatedUser);

      const result = await controller.changePhone(
        mockRequest as never,
        changePhoneDto,
      );

      expect(result.message).toBe(
        'Phone number updated successfully. Verification SMS sent.',
      );
      expect(result.user.phone).toBe(changePhoneDto.newPhone);
      expect(result.user.password).toBeUndefined();
      expect(mockUsersService.changePhone).toHaveBeenCalledWith(
        mockUserId,
        changePhoneDto,
      );
    });
  });

  describe('POST /users/profile/verify-email/send', () => {
    it('should send email verification code', async () => {
      mockUsersService.sendEmailVerification.mockResolvedValue(undefined);

      const result = await controller.sendEmailVerification(
        mockRequest as never,
      );

      expect(result).toEqual({
        message: 'Verification code sent to your email',
      });
      expect(mockUsersService.sendEmailVerification).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe('POST /users/profile/verify-email', () => {
    it('should verify email with code', async () => {
      const verifyCodeDto: VerifyCodeDto = {
        code: '123456',
      };

      mockUsersService.verifyEmailCode.mockResolvedValue(true);

      const result = await controller.verifyEmail(
        mockRequest as never,
        verifyCodeDto,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verified successfully');
      expect(mockUsersService.verifyEmailCode).toHaveBeenCalledWith(
        mockUserId,
        verifyCodeDto.code,
      );
    });
  });

  describe('POST /users/profile/verify-phone/send', () => {
    it('should send phone verification code', async () => {
      mockUsersService.sendPhoneVerification.mockResolvedValue(undefined);

      const result = await controller.sendPhoneVerification(
        mockRequest as never,
      );

      expect(result).toEqual({
        message: 'Verification code sent to your phone',
      });
      expect(mockUsersService.sendPhoneVerification).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe('POST /users/profile/verify-phone', () => {
    it('should verify phone with code', async () => {
      const verifyCodeDto: VerifyCodeDto = {
        code: '654321',
      };

      mockUsersService.verifyPhoneCode.mockResolvedValue(true);

      const result = await controller.verifyPhone(
        mockRequest as never,
        verifyCodeDto,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Phone verified successfully');
      expect(mockUsersService.verifyPhoneCode).toHaveBeenCalledWith(
        mockUserId,
        verifyCodeDto.code,
      );
    });
  });

  describe('POST /users/deactivate', () => {
    it('should deactivate account', async () => {
      mockUsersService.deactivateAccount.mockResolvedValue(undefined);

      const result = await controller.deactivateAccount(mockRequest as never);

      expect(result.message).toBe(
        'Account deactivated successfully. Log in anytime to reactivate.',
      );
      expect(mockUsersService.deactivateAccount).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe('POST /users/delete-permanently', () => {
    it('should schedule account deletion', async () => {
      mockUsersService.scheduleDeletion.mockResolvedValue(undefined);

      const result = await controller.scheduleDeletion(mockRequest as never);

      expect(result.message).toBe(
        'Account scheduled for deletion. You have 30 days to cancel by logging back in.',
      );
      expect(mockUsersService.scheduleDeletion).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe('POST /users/cancel-deletion', () => {
    it('should cancel account deletion', async () => {
      mockUsersService.cancelDeletion.mockResolvedValue(undefined);

      const result = await controller.cancelDeletion(mockRequest as never);

      expect(result.message).toBe(
        'Account deletion cancelled. Your account is now active.',
      );
      expect(mockUsersService.cancelDeletion).toHaveBeenCalledWith(mockUserId);
    });
  });
});
