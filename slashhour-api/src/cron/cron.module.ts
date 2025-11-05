import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { VerificationModule } from '../services/verification/verification.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    VerificationModule,
  ],
  providers: [TasksService],
})
export class CronModule {}
