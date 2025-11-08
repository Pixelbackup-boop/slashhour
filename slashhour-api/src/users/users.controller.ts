import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePhoneDto } from './dto/change-phone.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive fields
    const { password, ...userProfile } = user;
    return userProfile;
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(userId, updateDto);

    // Remove sensitive fields
    const { password, ...userProfile } = user;
    return userProfile;
  }

  @Get('profile/stats')
  async getUserStats(@CurrentUser('id') userId: string): Promise<UserStatsDto> {
    return this.usersService.getUserStats(userId);
  }

  @Post('profile/password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.usersService.uploadAvatar(userId, file);
    const { password, ...userProfile } = user;
    return { message: 'Avatar uploaded successfully', user: userProfile };
  }

  // ============================================
  // ACCOUNT MANAGEMENT ENDPOINTS (NEW)
  // ============================================

  @Post('profile/email')
  async changeEmail(
    @CurrentUser('id') userId: string,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    const user = await this.usersService.changeEmail(userId, changeEmailDto);
    const { password, ...userProfile } = user;
    return {
      message: 'Email updated successfully. Verification email sent.',
      user: userProfile,
    };
  }

  @Post('profile/phone')
  async changePhone(
    @CurrentUser('id') userId: string,
    @Body() changePhoneDto: ChangePhoneDto,
  ) {
    const user = await this.usersService.changePhone(userId, changePhoneDto);
    const { password, ...userProfile } = user;
    return {
      message: 'Phone number updated successfully. Verification SMS sent.',
      user: userProfile,
    };
  }

  @Post('profile/verify-email/send')
  async sendEmailVerification(@CurrentUser('id') userId: string) {
    await this.usersService.sendEmailVerification(userId);
    return { message: 'Verification code sent to your email' };
  }

  @Post('profile/verify-email')
  async verifyEmail(
    @CurrentUser('id') userId: string,
    @Body() verifyCodeDto: VerifyCodeDto,
  ) {
    const success = await this.usersService.verifyEmailCode(userId, verifyCodeDto.code);
    return {
      success,
      message: 'Email verified successfully',
    };
  }

  @Post('profile/verify-phone/send')
  async sendPhoneVerification(@CurrentUser('id') userId: string) {
    await this.usersService.sendPhoneVerification(userId);
    return { message: 'Verification code sent to your phone' };
  }

  @Post('profile/verify-phone')
  async verifyPhone(
    @CurrentUser('id') userId: string,
    @Body() verifyCodeDto: VerifyCodeDto,
  ) {
    const success = await this.usersService.verifyPhoneCode(userId, verifyCodeDto.code);
    return {
      success,
      message: 'Phone verified successfully',
    };
  }

  @Post('deactivate')
  async deactivateAccount(@CurrentUser('id') userId: string) {
    await this.usersService.deactivateAccount(userId);
    return {
      message: 'Account deactivated successfully. Log in anytime to reactivate.',
    };
  }

  @Post('delete-permanently')
  async scheduleDeletion(@CurrentUser('id') userId: string) {
    await this.usersService.scheduleDeletion(userId);
    return {
      message: 'Account scheduled for deletion. You have 30 days to cancel by logging back in.',
    };
  }

  @Post('cancel-deletion')
  async cancelDeletion(@CurrentUser('id') userId: string) {
    await this.usersService.cancelDeletion(userId);
    return {
      message: 'Account deletion cancelled. Your account is now active.',
    };
  }
}
