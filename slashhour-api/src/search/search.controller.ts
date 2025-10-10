import { Controller, Get, Query } from '@nestjs/common';
import { SearchService, BusinessSearchFilters, DealSearchFilters } from './search.service';
import { BusinessCategory } from '../businesses/entities/business.entity';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('businesses')
  async searchBusinesses(
    @Query('q') query?: string,
    @Query('category') category?: BusinessCategory,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
    @Query('verified') verified?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const filters: BusinessSearchFilters = {
      query,
      category,
      lat,
      lng,
      radius,
      verified,
    };

    return this.searchService.searchBusinesses(filters, page, limit);
  }

  @Get('deals')
  async searchDeals(
    @Query('q') query?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minDiscount') minDiscount?: number,
    @Query('flashOnly') flashOnly?: boolean,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
    @Query('tags') tags?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const filters: DealSearchFilters = {
      query,
      category,
      minPrice,
      maxPrice,
      minDiscount,
      flashOnly,
      lat,
      lng,
      radius,
      tags: tags ? tags.split(',') : undefined,
    };

    return this.searchService.searchDeals(filters, page, limit);
  }

  @Get('all')
  async searchAll(
    @Query('q') query: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
  ) {
    return this.searchService.searchAll(query, lat, lng, radius);
  }
}
