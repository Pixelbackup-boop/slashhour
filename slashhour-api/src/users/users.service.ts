import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePhoneDto } from './dto/change-phone.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../services/verification/verification.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
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

  async create(userData: Partial<User>): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByIdentifier(
      userData.email || userData.phone || userData.username || '',
    );

    if (existingUser) {
      throw new ConflictException('User with this email, phone, or username already exists');
    }

    const prismaUser = await this.prisma.users.create({
      data: userData as any,
    });
    return this.transformPrismaUser(prismaUser);
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const prismaUser = await this.prisma.users.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { username: identifier },
        ],
      },
    });
    return prismaUser ? this.transformPrismaUser(prismaUser) : null;
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.users.findUnique({
      where: { id },
    });
    return prismaUser ? this.transformPrismaUser(prismaUser) : null;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const prismaUser = await this.prisma.users.update({
        where: { id },
        data: updateData as any,
      });
      return this.transformPrismaUser(prismaUser);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for unique constraint violations
    if (updateDto.email && updateDto.email !== user.email) {
      const existingEmail = await this.prisma.users.findUnique({
        where: { email: updateDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateDto.username && updateDto.username !== user.username) {
      const existingUsername = await this.prisma.users.findFirst({
        where: { username: updateDto.username },
      });
      if (existingUsername) {
        throw new ConflictException('Username already in use');
      }
    }

    if (updateDto.phone && updateDto.phone !== user.phone) {
      const existingPhone = await this.prisma.users.findFirst({
        where: { phone: updateDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already in use');
      }
    }

    // Update user fields
    const prismaUser = await this.prisma.users.update({
      where: { id: userId },
      data: updateDto as any,
    });
    return this.transformPrismaUser(prismaUser);
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all redemptions for the user with business relation
    const redemptions = await this.prisma.user_redemptions.findMany({
      where: {
        user_id: userId,
      },
      include: {
        businesses: true,
        users: true,
      },
    });

    // Calculate total savings
    const totalSavings = redemptions.reduce(
      (sum, r) => sum + parseFloat(r.savings_amount.toString()),
      0,
    );

    // Calculate monthly savings and redemptions (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRedemptionsList = redemptions.filter(
      (r) => new Date(r.redeemed_at) >= startOfMonth,
    );
    const monthlySavings = monthlyRedemptionsList.reduce(
      (sum, r) => sum + parseFloat(r.savings_amount.toString()),
      0,
    );

    // Count redemptions
    const totalRedemptions = redemptions.length;
    const monthlyRedemptions = monthlyRedemptionsList.length;

    // Calculate categories used
    const categoryCount = new Map<string, number>();
    redemptions.forEach((r) => {
      categoryCount.set(
        r.deal_category,
        (categoryCount.get(r.deal_category) || 0) + 1,
      );
    });
    const categoriesUsed = categoryCount.size;
    const totalCategories = 8; // From constants: restaurant, grocery, fashion, shoes, electronics, home_living, beauty, health

    const favoriteCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    // Get following count
    const followingCount = await this.prisma.follows.count({
      where: {
        user_id: userId,
        status: 'active' as any,
      },
    });

    // Calculate most saved business
    const businessSavings = new Map<string, { id: string; name: string; total: number }>();
    redemptions.forEach((r) => {
      const businessId = r.businesses.id;
      const existing = businessSavings.get(businessId) || {
        id: businessId,
        name: r.businesses.business_name,
        total: 0,
      };
      businessSavings.set(businessId, {
        id: existing.id,
        name: existing.name,
        total: existing.total + parseFloat(r.savings_amount.toString()),
      });
    });

    let mostSavedBusiness: {
      businessId: string;
      businessName: string;
      totalSaved: number;
    } | undefined = undefined;
    if (businessSavings.size > 0) {
      const [businessId, data] = Array.from(businessSavings.entries()).sort(
        (a, b) => b[1].total - a[1].total,
      )[0];
      mostSavedBusiness = {
        businessId,
        businessName: data.name,
        totalSaved: data.total,
      };
    }

    // Calculate savings vs goal
    let savingsVsGoal: {
      goal: number;
      achieved: number;
      percentage: number;
    } | undefined = undefined;
    if (user.monthly_savings_goal) {
      const goal = parseFloat(user.monthly_savings_goal.toString());
      savingsVsGoal = {
        goal,
        achieved: monthlySavings,
        percentage: Math.round((monthlySavings / goal) * 100),
      };
    }

    return {
      totalSavings,
      totalRedemptions,
      monthlySavings,
      monthlyRedemptions,
      categoriesUsed,
      totalCategories,
      followingCount,
      favoriteCategories,
      mostSavedBusiness,
      savingsVsGoal,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    // Get user with password
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update password
    await this.prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Convert image to base64 data URL
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Update avatar URL
    const prismaUser = await this.prisma.users.update({
      where: { id: userId },
      data: { avatar_url: base64Image },
    });
    return this.transformPrismaUser(prismaUser);
  }

  // ============================================
  // ACCOUNT MANAGEMENT (NEW)
  // ============================================

  /**
   * Change user email address
   * Sets email_verified to false and returns updated user
   */
  async changeEmail(userId: string, changeEmailDto: ChangeEmailDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already in use
    const existingEmail = await this.prisma.users.findUnique({
      where: { email: changeEmailDto.newEmail },
    });
    if (existingEmail && existingEmail.id !== userId) {
      throw new ConflictException('Email already in use');
    }

    // Update email and set verified to false
    const prismaUser = await this.prisma.users.update({
      where: { id: userId },
      data: {
        email: changeEmailDto.newEmail,
        email_verified: false,
      },
    });

    return this.transformPrismaUser(prismaUser);
  }

  /**
   * Change user phone number
   * Sets phone_verified to false and returns updated user
   */
  async changePhone(userId: string, changePhoneDto: ChangePhoneDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if phone is already in use
    const existingPhone = await this.prisma.users.findUnique({
      where: { phone: changePhoneDto.newPhone },
    });
    if (existingPhone && existingPhone.id !== userId) {
      throw new ConflictException('Phone number already in use');
    }

    // Update phone and set verified to false
    const prismaUser = await this.prisma.users.update({
      where: { id: userId },
      data: {
        phone: changePhoneDto.newPhone,
        phone_verified: false,
      },
    });

    return this.transformPrismaUser(prismaUser);
  }

  /**
   * Deactivate account (temporary)
   * User can reactivate by logging back in
   */
  async deactivateAccount(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.users.update({
      where: { id: userId },
      data: { status: 'inactive' },
    });
  }

  /**
   * Schedule account for permanent deletion
   * Sets status to 'pending_deletion' with 30-day grace period
   */
  async scheduleDeletion(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Set deletion date to 30 days from now
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        status: 'pending_deletion',
        scheduled_deletion_date: deletionDate,
      },
    });
  }

  /**
   * Cancel scheduled deletion and reactivate account
   * Called when user logs in during grace period
   */
  async cancelDeletion(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'pending_deletion') {
      throw new BadRequestException('Account is not scheduled for deletion');
    }

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        status: 'active',
        scheduled_deletion_date: null,
      },
    });
  }

  /**
   * Send verification email
   */
  async sendEmailVerification(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.email) {
      throw new BadRequestException('No email address on file');
    }

    await this.verificationService.sendEmailVerificationCode(userId, user.email);
  }

  /**
   * Send verification SMS
   */
  async sendPhoneVerification(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.phone) {
      throw new BadRequestException('No phone number on file');
    }

    await this.verificationService.sendPhoneVerificationCode(userId, user.phone);
  }

  /**
   * Verify email code
   */
  async verifyEmailCode(userId: string, code: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.verificationService.verifyCode(userId, code, 'email');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    return true;
  }

  /**
   * Verify phone code
   */
  async verifyPhoneCode(userId: string, code: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.verificationService.verifyCode(userId, code, 'phone');
    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    return true;
  }
}
