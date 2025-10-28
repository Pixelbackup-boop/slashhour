import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post('reviews')
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.id, createReviewDto);
  }

  @Patch('reviews/:id')
  async updateReview(
    @Request() req,
    @Param('id') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(req.user.id, reviewId, updateReviewDto);
  }

  @Delete('reviews/:id')
  async deleteReview(@Request() req, @Param('id') reviewId: string) {
    return this.reviewsService.deleteReview(req.user.id, reviewId);
  }

  @Get('businesses/:businessId/reviews')
  async getBusinessReviews(
    @Param('businessId') businessId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.reviewsService.getBusinessReviews(
      businessId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('businesses/:businessId/my-review')
  async getUserReview(@Request() req, @Param('businessId') businessId: string) {
    return this.reviewsService.getUserReview(req.user.id, businessId);
  }
}
