import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRedemption } from './entities/user-redemption.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
    const total_savings = redemptions.reduce(
      (sum, r) => sum + parseFloat(r.savings_amount.toString()),
      0,
    );

    // Calculate monthly savings (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRedemptions = redemptions.filter(
      (r) => new Date(r.redeemed_at) >= startOfMonth,
    );
    const monthly_savings = monthlyRedemptions.reduce(
      (sum, r) => sum + parseFloat(r.savings_amount.toString()),
      0,
    );

    // Count redemptions
    const total_redemptions = redemptions.length;

    // Calculate favorite categories
    const categoryCount = new Map<string, number>();
    redemptions.forEach((r) => {
      categoryCount.set(
        r.deal_category,
        (categoryCount.get(r.deal_category) || 0) + 1,
      );
    });
    const favorite_categories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

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

    let most_saved_business: {
      business_id: string;
      business_name: string;
      total_saved: number;
    } | null = null;
    if (businessSavings.size > 0) {
      const [business_id, data] = Array.from(businessSavings.entries()).sort(
        (a, b) => b[1].total - a[1].total,
      )[0];
      most_saved_business = {
        business_id,
        business_name: data.name,
        total_saved: data.total,
      };
    }

    // Calculate savings vs goal
    let savings_vs_goal: {
      goal: number;
      achieved: number;
      percentage: number;
    } | null = null;
    if (user.monthly_savings_goal) {
      const goal = parseFloat(user.monthly_savings_goal.toString());
      savings_vs_goal = {
        goal,
        achieved: monthly_savings,
        percentage: Math.round((monthly_savings / goal) * 100),
      };
    }

    return {
      total_savings,
      total_redemptions,
      monthly_savings,
      favorite_categories,
      most_saved_business,
      savings_vs_goal,
    };
  }
}
