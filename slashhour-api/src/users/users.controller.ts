import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive fields
    const { password, ...userProfile } = user;
    return userProfile;
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(
      req.user.id,
      updateDto,
    );

    // Remove sensitive fields
    const { password, ...userProfile } = user;
    return userProfile;
  }

  @Get('profile/stats')
  async getUserStats(@Request() req): Promise<UserStatsDto> {
    return this.usersService.getUserStats(req.user.id);
  }
}
