import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createBusinessDto: CreateBusinessDto) {
    return this.businessesService.create(req.user.id, createBusinessDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.businessesService.findAll(page, limit);
  }

  @Get('my-businesses')
  @UseGuards(JwtAuthGuard)
  async getMyBusinesses(@Request() req) {
    return this.businessesService.findByOwner(req.user.id);
  }

  @Get('search')
  async searchByLocation(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 5,
    @Query('category') category?: string,
  ) {
    return this.businessesService.searchByLocation(lat, lng, radius, category);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }

  @Get(':id/deals')
  async getBusinessDeals(@Param('id') id: string) {
    return this.businessesService.getBusinessDeals(id);
  }

  @Get(':id/stats')
  async getBusinessStats(@Param('id') id: string) {
    return this.businessesService.getBusinessStats(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    return this.businessesService.update(id, req.user.id, updateBusinessDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Request() req, @Param('id') id: string) {
    return this.businessesService.delete(id, req.user.id);
  }

  @Post(':id/logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const business = await this.businessesService.uploadLogo(id, req.user.id, file);
    return { message: 'Logo uploaded successfully', business };
  }

  @Post(':id/cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cover'))
  async uploadCover(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const business = await this.businessesService.uploadCoverImage(id, req.user.id, file);
    return { message: 'Cover image uploaded successfully', business };
  }
}
