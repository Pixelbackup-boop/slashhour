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
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePhoneDto } from './dto/change-phone.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
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

  // ============================================
  // ACCOUNT MANAGEMENT ENDPOINTS (NEW)
  // ============================================

  @Post('profile/email')
  async changeEmail(@Request() req, @Body() changeEmailDto: ChangeEmailDto) {
    const user = await this.usersService.changeEmail(req.user.id, changeEmailDto);
    const { password, ...userProfile } = user;
    return {
      message: 'Email updated successfully. Verification email sent.',
      user: userProfile,
    };
  }

  @Post('profile/phone')
  async changePhone(@Request() req, @Body() changePhoneDto: ChangePhoneDto) {
    const user = await this.usersService.changePhone(req.user.id, changePhoneDto);
    const { password, ...userProfile } = user;
    return {
      message: 'Phone number updated successfully. Verification SMS sent.',
      user: userProfile,
    };
  }

  @Post('profile/verify-email/send')
  async sendEmailVerification(@Request() req) {
    await this.usersService.sendEmailVerification(req.user.id);
    return { message: 'Verification code sent to your email' };
  }

  @Post('profile/verify-email')
  async verifyEmail(@Request() req, @Body() verifyCodeDto: VerifyCodeDto) {
    const success = await this.usersService.verifyEmailCode(req.user.id, verifyCodeDto.code);
    return {
      success,
      message: 'Email verified successfully',
    };
  }

  @Post('profile/verify-phone/send')
  async sendPhoneVerification(@Request() req) {
    await this.usersService.sendPhoneVerification(req.user.id);
    return { message: 'Verification code sent to your phone' };
  }

  @Post('profile/verify-phone')
  async verifyPhone(@Request() req, @Body() verifyCodeDto: VerifyCodeDto) {
    const success = await this.usersService.verifyPhoneCode(req.user.id, verifyCodeDto.code);
    return {
      success,
      message: 'Phone verified successfully',
    };
  }

  @Post('deactivate')
  async deactivateAccount(@Request() req) {
    await this.usersService.deactivateAccount(req.user.id);
    return {
      message: 'Account deactivated successfully. Log in anytime to reactivate.',
    };
  }

  @Post('delete-permanently')
  async scheduleDeletion(@Request() req) {
    await this.usersService.scheduleDeletion(req.user.id);
    return {
      message: 'Account scheduled for deletion. You have 30 days to cancel by logging back in.',
    };
  }

  @Post('cancel-deletion')
  async cancelDeletion(@Request() req) {
    await this.usersService.cancelDeletion(req.user.id);
    return {
      message: 'Account deletion cancelled. Your account is now active.',
    };
  }
}
