import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../services/verification/verification.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let verificationService: VerificationService;

  const mockUserId = 'user-123';
  const mockEmail = 'test@example.com';
  const mockPhone = '+1234567890';
  const mockUsername = 'testuser';

  const mockUser = {
    id: mockUserId,
    email: mockEmail,
    phone: mockPhone,
    username: mockUsername,
    password: 'hashed-password',
    name: 'Test User',
    user_type: 'consumer',
    avatar_url: null,
    default_location: { lat: 40.7128, lng: -74.0060 },
    default_radius_km: 5,
    notify_nearby_deals: false,
    preferred_categories: [],
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',
    monthly_savings_goal: null,
    inflation_rate_reference: 7.5,
    status: 'active',
    email_verified: false,
    phone_verified: false,
    scheduled_deletion_date: null,
    created_at: new Date(),
    updated_at: new Date(),
    last_active_at: new Date(),
  };

  // Type-safe mocks (2025 best practice)
  const mockPrismaService: {
    users: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    user_redemptions: {
      findMany: jest.Mock;
    };
    follows: {
      count: jest.Mock<Promise<number>, unknown[]>;
    };
  } = {
    users: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user_redemptions: {
      findMany: jest.fn(),
    },
    follows: {
      count: jest.fn(),
    },
  };

  const mockVerificationService: {
    sendEmailVerificationCode: jest.Mock<Promise<void>, [string, string]>;
    sendPhoneVerificationCode: jest.Mock<Promise<void>, [string, string]>;
    verifyCode: jest.Mock<Promise<boolean>, [string, string, string]>;
  } = {
    sendEmailVerificationCode: jest.fn(),
    sendPhoneVerificationCode: jest.fn(),
    verifyCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: VerificationService, useValue: mockVerificationService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    verificationService = module.get<VerificationService>(VerificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        name: 'New User',
        userType: 'consumer',
      };

      mockPrismaService.users.findFirst.mockResolvedValue(null);
      mockPrismaService.users.create.mockResolvedValue({
        ...mockUser,
        ...userData,
        user_type: userData.userType,
      });

      const result = await service.create(userData);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
      expect(mockPrismaService.users.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.create({
          email: mockEmail,
          username: 'anotheruser',
          password: 'password123',
          userType: 'consumer',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if username already exists', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.create({
          email: 'another@example.com',
          username: mockUsername,
          password: 'password123',
          userType: 'consumer',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if phone already exists', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.create({
          phone: mockPhone,
          username: 'anotheruser',
          password: 'password123',
          userType: 'consumer',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByIdentifier', () => {
    it('should find user by email', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByIdentifier(mockEmail);

      expect(result).toHaveProperty('id', mockUserId);
      expect(mockPrismaService.users.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: mockEmail },
            { phone: mockEmail },
            { username: mockEmail },
          ],
        },
      });
    });

    it('should find user by phone', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByIdentifier(mockPhone);

      expect(result).toHaveProperty('id', mockUserId);
    });

    it('should find user by username', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByIdentifier(mockUsername);

      expect(result).toHaveProperty('id', mockUserId);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(null);

      const result = await service.findByIdentifier('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(mockUserId);

      expect(result).toHaveProperty('id', mockUserId);
      expect(mockPrismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };

      mockPrismaService.users.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUserId, updateData);

      expect(result.name).toBe('Updated Name');
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: updateData,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.users.update.mockRejectedValue(new Error('Not found'));

      await expect(
        service.update('nonexistent-id', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateDto = {
        name: 'Updated Name',
        avatar_url: 'http://example.com/avatar.jpg',
      };

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.updateProfile(mockUserId, updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it('should throw ConflictException if new email already exists', async () => {
      const existingUser = {
        id: 'other-user-id',
        email: 'existing@example.com',
      };

      mockPrismaService.users.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.users.findUnique.mockResolvedValueOnce(existingUser);

      await expect(
        service.updateProfile(mockUserId, { email: 'existing@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating to same email', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue(mockUser);

      // Should not throw when updating to same email
      await expect(
        service.updateProfile(mockUserId, { email: mockEmail }),
      ).resolves.toBeTruthy();
    });

    it('should throw ConflictException if new username already exists', async () => {
      const existingUser = {
        id: 'other-user-id',
        username: 'existinguser',
      };

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.findFirst.mockResolvedValue(existingUser);

      await expect(
        service.updateProfile(mockUserId, { username: 'existinguser' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if new phone already exists', async () => {
      const existingUser = {
        id: 'other-user-id',
        phone: '+0987654321',
      };

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.findFirst.mockResolvedValue(existingUser);

      await expect(
        service.updateProfile(mockUserId, { phone: '+0987654321' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getUserStats', () => {
    it('should calculate user statistics correctly', async () => {
      const redemptions = [
        {
          id: 'redemption-1',
          user_id: mockUserId,
          deal_id: 'deal-1',
          business_id: 'business-1',
          original_price: 20,
          paid_price: 10,
          savings_amount: 10,
          deal_category: 'restaurant',
          redeemed_at: new Date(),
          businesses: {
            id: 'business-1',
            business_name: 'Pizza Shop',
          },
          users: mockUser,
        },
        {
          id: 'redemption-2',
          user_id: mockUserId,
          deal_id: 'deal-2',
          business_id: 'business-1',
          original_price: 30,
          paid_price: 15,
          savings_amount: 15,
          deal_category: 'grocery',
          redeemed_at: new Date(),
          businesses: {
            id: 'business-1',
            business_name: 'Pizza Shop',
          },
          users: mockUser,
        },
      ];

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user_redemptions.findMany.mockResolvedValue(redemptions);
      mockPrismaService.follows.count.mockResolvedValue(5);

      const result = await service.getUserStats(mockUserId);

      expect(result.totalSavings).toBe(25); // 10 + 15
      expect(result.totalRedemptions).toBe(2);
      expect(result.categoriesUsed).toBe(2); // restaurant, grocery
      expect(result.followingCount).toBe(5);
      expect(result.mostSavedBusiness).toEqual({
        businessId: 'business-1',
        businessName: 'Pizza Shop',
        totalSaved: 25,
      });
    });

    it('should calculate monthly statistics correctly', async () => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

      const redemptions = [
        {
          id: 'redemption-1',
          user_id: mockUserId,
          deal_id: 'deal-1',
          business_id: 'business-1',
          savings_amount: 10,
          deal_category: 'restaurant',
          redeemed_at: thisMonth,
          businesses: { id: 'business-1', business_name: 'Shop' },
          users: mockUser,
        },
        {
          id: 'redemption-2',
          user_id: mockUserId,
          deal_id: 'deal-2',
          business_id: 'business-1',
          savings_amount: 15,
          deal_category: 'grocery',
          redeemed_at: lastMonth,
          businesses: { id: 'business-1', business_name: 'Shop' },
          users: mockUser,
        },
      ];

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user_redemptions.findMany.mockResolvedValue(redemptions);
      mockPrismaService.follows.count.mockResolvedValue(0);

      const result = await service.getUserStats(mockUserId);

      expect(result.monthlySavings).toBe(10); // Only this month
      expect(result.monthlyRedemptions).toBe(1);
      expect(result.totalSavings).toBe(25); // All time
      expect(result.totalRedemptions).toBe(2);
    });

    it('should calculate favorite categories correctly', async () => {
      const redemptions = [
        {
          id: 'r1',
          deal_category: 'restaurant',
          savings_amount: 10,
          redeemed_at: new Date(),
          businesses: { id: 'b1', business_name: 'Shop' },
          users: mockUser,
        },
        {
          id: 'r2',
          deal_category: 'restaurant',
          savings_amount: 10,
          redeemed_at: new Date(),
          businesses: { id: 'b1', business_name: 'Shop' },
          users: mockUser,
        },
        {
          id: 'r3',
          deal_category: 'grocery',
          savings_amount: 10,
          redeemed_at: new Date(),
          businesses: { id: 'b1', business_name: 'Shop' },
          users: mockUser,
        },
      ];

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user_redemptions.findMany.mockResolvedValue(redemptions);
      mockPrismaService.follows.count.mockResolvedValue(0);

      const result = await service.getUserStats(mockUserId);

      expect(result.favoriteCategories[0]).toBe('restaurant'); // Most used
      expect(result.favoriteCategories[1]).toBe('grocery');
    });

    it('should calculate savings vs goal when goal is set', async () => {
      const userWithGoal = {
        ...mockUser,
        monthly_savings_goal: 50,
      };

      mockPrismaService.users.findUnique.mockResolvedValue(userWithGoal);
      mockPrismaService.user_redemptions.findMany.mockResolvedValue([
        {
          id: 'r1',
          savings_amount: 30,
          deal_category: 'restaurant',
          redeemed_at: new Date(),
          businesses: { id: 'b1', business_name: 'Shop' },
          users: mockUser,
        },
      ]);
      mockPrismaService.follows.count.mockResolvedValue(0);

      const result = await service.getUserStats(mockUserId);

      expect(result.savingsVsGoal).toEqual({
        goal: 50,
        achieved: 30,
        percentage: 60, // (30/50) * 100
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.getUserStats(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const currentPassword = 'oldpassword';
      const newPassword = 'newpassword123';
      const hashedOldPassword = await bcrypt.hash(currentPassword, 10);

      mockPrismaService.users.findUnique.mockResolvedValue({
        id: mockUserId,
        password: hashedOldPassword,
      });
      mockPrismaService.users.update.mockResolvedValue({} as never);

      await expect(
        service.changePassword(mockUserId, {
          currentPassword,
          newPassword,
        }),
      ).resolves.not.toThrow();

      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { password: expect.any(String) },
      });
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      mockPrismaService.users.findUnique.mockResolvedValue({
        id: mockUserId,
        password: hashedPassword,
      });

      await expect(
        service.changePassword(mockUserId, {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword(mockUserId, {
          currentPassword: 'oldpass',
          newPassword: 'newpass',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        avatar_url: 'data:image/jpeg;base64,ZmFrZS1pbWFnZS1kYXRh',
      });

      const result = await service.uploadAvatar(mockUserId, mockFile);

      expect(result.avatar_url).toContain('data:image/jpeg;base64');
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { avatar_url: expect.stringContaining('base64') },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      const mockFile = {
        buffer: Buffer.from('fake-image'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      await expect(service.uploadAvatar(mockUserId, mockFile)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changeEmail', () => {
    it('should change email and set verified to false', async () => {
      const newEmail = 'newemail@example.com';

      mockPrismaService.users.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.users.findUnique.mockResolvedValueOnce(null); // Email not taken
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        email: newEmail,
        email_verified: false,
      });

      const result = await service.changeEmail(mockUserId, { newEmail });

      expect(result.email).toBe(newEmail);
      expect(result.email_verified).toBe(false);
      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: {
          email: newEmail,
          email_verified: false,
        },
      });
    });

    it('should throw ConflictException if email already in use', async () => {
      const existingUser = { id: 'other-user', email: 'taken@example.com' };

      mockPrismaService.users.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.users.findUnique.mockResolvedValueOnce(existingUser);

      await expect(
        service.changeEmail(mockUserId, { newEmail: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('changePhone', () => {
    it('should change phone and set verified to false', async () => {
      const newPhone = '+0987654321';

      mockPrismaService.users.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.users.findUnique.mockResolvedValueOnce(null); // Phone not taken
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        phone: newPhone,
        phone_verified: false,
      });

      const result = await service.changePhone(mockUserId, { newPhone });

      expect(result.phone).toBe(newPhone);
      expect(result.phone_verified).toBe(false);
    });

    it('should throw ConflictException if phone already in use', async () => {
      const existingUser = { id: 'other-user', phone: '+0987654321' };

      mockPrismaService.users.findUnique.mockResolvedValueOnce(mockUser);
      mockPrismaService.users.findUnique.mockResolvedValueOnce(existingUser);

      await expect(
        service.changePhone(mockUserId, { newPhone: '+0987654321' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deactivateAccount', () => {
    it('should set user status to inactive', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        status: 'inactive',
      });

      await service.deactivateAccount(mockUserId);

      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { status: 'inactive' },
      });
    });
  });

  describe('scheduleDeletion', () => {
    it('should schedule account deletion 30 days from now', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue({} as never);

      await service.scheduleDeletion(mockUserId);

      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: {
          status: 'pending_deletion',
          scheduled_deletion_date: expect.any(Date),
        },
      });

      // Verify it's approximately 30 days from now
      const call = mockPrismaService.users.update.mock.calls[0][0];
      const deletionDate = new Date(call.data.scheduled_deletion_date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 30);

      const diff = Math.abs(deletionDate.getTime() - expectedDate.getTime());
      expect(diff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe('cancelDeletion', () => {
    it('should cancel scheduled deletion and reactivate account', async () => {
      const userPendingDeletion = {
        ...mockUser,
        status: 'pending_deletion',
        scheduled_deletion_date: new Date(),
      };

      mockPrismaService.users.findUnique.mockResolvedValue(userPendingDeletion);
      mockPrismaService.users.update.mockResolvedValue({
        ...mockUser,
        status: 'active',
        scheduled_deletion_date: null,
      });

      await service.cancelDeletion(mockUserId);

      expect(mockPrismaService.users.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: {
          status: 'active',
          scheduled_deletion_date: null,
        },
      });
    });

    it('should throw BadRequestException if account not scheduled for deletion', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      await expect(service.cancelDeletion(mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Verification Methods', () => {
    describe('sendEmailVerification', () => {
      it('should send email verification code', async () => {
        mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
        mockVerificationService.sendEmailVerificationCode.mockResolvedValue(undefined);

        await service.sendEmailVerification(mockUserId);

        expect(mockVerificationService.sendEmailVerificationCode).toHaveBeenCalledWith(
          mockUserId,
          mockEmail,
        );
      });

      it('should throw BadRequestException if user has no email', async () => {
        const userWithoutEmail = { ...mockUser, email: null };
        mockPrismaService.users.findUnique.mockResolvedValue(userWithoutEmail);

        await expect(service.sendEmailVerification(mockUserId)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('sendPhoneVerification', () => {
      it('should send phone verification code', async () => {
        mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
        mockVerificationService.sendPhoneVerificationCode.mockResolvedValue(undefined);

        await service.sendPhoneVerification(mockUserId);

        expect(mockVerificationService.sendPhoneVerificationCode).toHaveBeenCalledWith(
          mockUserId,
          mockPhone,
        );
      });

      it('should throw BadRequestException if user has no phone', async () => {
        const userWithoutPhone = { ...mockUser, phone: null };
        mockPrismaService.users.findUnique.mockResolvedValue(userWithoutPhone);

        await expect(service.sendPhoneVerification(mockUserId)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('verifyEmailCode', () => {
      it('should verify email code successfully', async () => {
        mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
        mockVerificationService.verifyCode.mockResolvedValue(true);

        const result = await service.verifyEmailCode(mockUserId, '123456');

        expect(result).toBe(true);
        expect(mockVerificationService.verifyCode).toHaveBeenCalledWith(
          mockUserId,
          '123456',
          'email',
        );
      });

      it('should throw BadRequestException if code is invalid', async () => {
        mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
        mockVerificationService.verifyCode.mockResolvedValue(false);

        await expect(
          service.verifyEmailCode(mockUserId, 'invalid'),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('verifyPhoneCode', () => {
      it('should verify phone code successfully', async () => {
        mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
        mockVerificationService.verifyCode.mockResolvedValue(true);

        const result = await service.verifyPhoneCode(mockUserId, '123456');

        expect(result).toBe(true);
        expect(mockVerificationService.verifyCode).toHaveBeenCalledWith(
          mockUserId,
          '123456',
          'phone',
        );
      });
    });
  });
});
