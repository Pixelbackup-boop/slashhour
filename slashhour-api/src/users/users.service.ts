import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRedemption } from './entities/user-redemption.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserStatsDto } from './dto/user-stats.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRedemption)
    private redemptionRepository: Repository<UserRedemption>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByIdentifier(
      userData.email || userData.phone || userData.username || '',
    );

    if (existingUser) {
      throw new ConflictException('User with this email, phone, or username already exists');
    }

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [
        { email: identifier },
        { phone: identifier },
        { username: identifier },
      ],
    });
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for unique constraint violations
    if (updateDto.email && updateDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateDto.username && updateDto.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: updateDto.username },
      });
      if (existingUsername) {
        throw new ConflictException('Username already in use');
      }
    }

    if (updateDto.phone && updateDto.phone !== user.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: updateDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already in use');
      }
    }

    // Update user fields
    Object.assign(user, updateDto);
    return this.userRepository.save(user);
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all redemptions for the user with business relation
    const redemptions = await this.redemptionRepository
      .createQueryBuilder('redemption')
      .leftJoinAndSelect('redemption.business', 'business')
      .leftJoinAndSelect('redemption.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();

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
    const followingCount = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('follows', 'follow', 'follow.user_id = user.id')
      .where('user.id = :userId', { userId })
      .andWhere('follow.status = :status', { status: 'active' })
      .getCount();

    // Calculate most saved business
    const businessSavings = new Map<string, { id: string; name: string; total: number }>();
    redemptions.forEach((r) => {
      const businessId = r.business.id;
      const existing = businessSavings.get(businessId) || {
        id: businessId,
        name: r.business.business_name,
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
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();

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
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Convert image to base64 data URL
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Update avatar URL
    user.avatar_url = base64Image;
    return this.userRepository.save(user);
  }
}
