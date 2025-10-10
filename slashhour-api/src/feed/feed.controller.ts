import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get('you-follow')
  async getYouFollowFeed(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.feedService.getYouFollowFeed(req.user.id, page, limit);
  }

  @Get('near-you')
  async getNearYouFeed(
    @Request() req,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.feedService.getNearYouFeed(
      req.user.id,
      { lat, lng, radius },
      page,
      limit,
    );
  }
}
