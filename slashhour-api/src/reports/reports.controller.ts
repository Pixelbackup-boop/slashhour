import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

interface CreateReportDto {
  content_type: 'deal' | 'business' | 'review' | 'message' | 'user';
  content_id: string;
  reason: string;
  description?: string;
}

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createReport(@Body() body: CreateReportDto, @Req() req: Request) {
    const userId = (req.user as any).id;

    // Check if user already reported this content
    const existingReport = await this.prisma.reported_content.findFirst({
      where: {
        reporter_id: userId,
        content_type: body.content_type,
        content_id: body.content_id,
      },
    });

    if (existingReport) {
      return {
        message: 'You have already reported this content',
        report: existingReport,
      };
    }

    // Create new report
    const report = await this.prisma.reported_content.create({
      data: {
        reporter_id: userId,
        content_type: body.content_type as any,
        content_id: body.content_id,
        reason: body.reason,
        description: body.description || null,
        status: 'pending',
      },
    });

    // Get content title for message
    let contentTitle = 'this content';
    try {
      if (body.content_type === 'deal') {
        const deal = await this.prisma.deals.findUnique({
          where: { id: body.content_id },
          select: { title: true },
        });
        if (deal) contentTitle = `"${deal.title}"`;
      } else if (body.content_type === 'business') {
        const business = await this.prisma.businesses.findUnique({
          where: { id: body.content_id },
          select: { business_name: true },
        });
        if (business) contentTitle = `"${business.business_name}"`;
      }
    } catch (error) {
      // If we can't get the title, just use generic text
      console.log('Could not fetch content title for message:', error);
    }

    // Get or create conversation with Slashhour system account
    const SYSTEM_USER_ID = 'b7b0ae24-b87c-4024-a975-2e371c580336'; // Slashhour system user

    let conversation = await this.prisma.conversations.findFirst({
      where: {
        business_id: SYSTEM_USER_ID,
        customer_id: userId,
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversations.create({
        data: {
          business_id: SYSTEM_USER_ID,
          customer_id: userId,
          last_message_at: new Date(),
          last_message_text: 'Report confirmation',
        },
      });
    }

    // Send confirmation message from Slashhour
    const messageText = `Thanks for helping keep Slashhour safe! 🛡️\n\nWe've received your report about ${contentTitle}. Our team is reviewing it and will take appropriate action.\n\nReport ID: ${report.id.slice(0, 8)}`;

    await this.prisma.messages.create({
      data: {
        conversation_id: conversation.id,
        sender_id: SYSTEM_USER_ID,
        message_text: messageText,
        message_type: 'system',
        is_read: false,
      },
    });

    // Update conversation last message
    await this.prisma.conversations.update({
      where: { id: conversation.id },
      data: {
        last_message_at: new Date(),
        last_message_text: messageText.substring(0, 100),
        unread_count: { increment: 1 },
      },
    });

    return {
      message: 'Report submitted successfully',
      report,
    };
  }
}
