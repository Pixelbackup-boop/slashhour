import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { EmailModule } from '../email/email.module';
import { SMSModule } from '../sms/sms.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, EmailModule, SMSModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
