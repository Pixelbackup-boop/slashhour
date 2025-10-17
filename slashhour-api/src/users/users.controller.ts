import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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

  @Post('profile/password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    await this.usersService.changePassword(req.user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const user = await this.usersService.uploadAvatar(req.user.id, file);
    const { password, ...userProfile } = user;
    return { message: 'Avatar uploaded successfully', user: userProfile };
  }
}
