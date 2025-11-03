import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':dealId')
  @HttpCode(HttpStatus.CREATED)
  async addBookmark(@Request() req, @Param('dealId') dealId: string) {
    return this.bookmarksService.addBookmark(req.user.id, dealId);
  }

  @Delete(':dealId')
  @HttpCode(HttpStatus.OK)
  async removeBookmark(@Request() req, @Param('dealId') dealId: string) {
    return this.bookmarksService.removeBookmark(req.user.id, dealId);
  }

  @Get()
  async getUserBookmarks(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.bookmarksService.getUserBookmarks(
      req.user.id,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('check/:dealId')
  async isBookmarked(@Request() req, @Param('dealId') dealId: string) {
    const isBookmarked = await this.bookmarksService.isBookmarked(req.user.id, dealId);
    return { isBookmarked };
  }
}
