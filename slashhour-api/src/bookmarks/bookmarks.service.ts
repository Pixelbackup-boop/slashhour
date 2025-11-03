import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async addBookmark(userId: string, dealId: string) {
    // Check if deal exists and is active
    const deal = await this.prisma.deals.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (deal.status !== 'active') {
      throw new ConflictException('Can only bookmark active deals');
    }

    // Check if already bookmarked
    const existingBookmark = await this.prisma.bookmarks.findUnique({
      where: {
        user_id_deal_id: {
          user_id: userId,
          deal_id: dealId,
        },
      },
    });

    if (existingBookmark) {
      throw new ConflictException('Deal already bookmarked');
    }

    // Create bookmark
    const bookmark = await this.prisma.bookmarks.create({
      data: {
        user_id: userId,
        deal_id: dealId,
      },
    });

    // Increment save_count on deal
    await this.prisma.deals.update({
      where: { id: dealId },
      data: { save_count: { increment: 1 } },
    });

    return bookmark;
  }

  async removeBookmark(userId: string, dealId: string) {
    const bookmark = await this.prisma.bookmarks.findUnique({
      where: {
        user_id_deal_id: {
          user_id: userId,
          deal_id: dealId,
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmarks.delete({
      where: { id: bookmark.id },
    });

    // Decrement save_count on deal
    await this.prisma.deals.update({
      where: { id: dealId },
      data: { save_count: { decrement: 1 } },
    });

    return { message: 'Bookmark removed successfully' };
  }

  async getUserBookmarks(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const bookmarks = await this.prisma.bookmarks.findMany({
      where: { user_id: userId },
      include: {
        deals: {
          include: {
            businesses: {
              select: {
                id: true,
                business_name: true,
                slug: true,
                logo_url: true,
                category: true,
                location: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prisma.bookmarks.count({
      where: { user_id: userId },
    });

    // Format the response to match frontend Deal type
    const formattedDeals = bookmarks
      .filter((b) => b.deals) // Filter out any null deals
      .map((bookmark) => ({
        ...bookmark.deals,
        business: bookmark.deals.businesses,
        isBookmarked: true,
      }));

    return {
      deals: formattedDeals,
      total,
      page,
      limit,
      hasMore: skip + bookmarks.length < total,
    };
  }

  async isBookmarked(userId: string, dealId: string): Promise<boolean> {
    const bookmark = await this.prisma.bookmarks.findUnique({
      where: {
        user_id_deal_id: {
          user_id: userId,
          deal_id: dealId,
        },
      },
    });

    return !!bookmark;
  }

  async getBookmarkStatusForDeals(userId: string, dealIds: string[]): Promise<Record<string, boolean>> {
    const bookmarks = await this.prisma.bookmarks.findMany({
      where: {
        user_id: userId,
        deal_id: { in: dealIds },
      },
      select: { deal_id: true },
    });

    const bookmarkMap: Record<string, boolean> = {};
    dealIds.forEach((id) => {
      bookmarkMap[id] = false;
    });

    bookmarks.forEach((bookmark) => {
      bookmarkMap[bookmark.deal_id] = true;
    });

    return bookmarkMap;
  }
}
