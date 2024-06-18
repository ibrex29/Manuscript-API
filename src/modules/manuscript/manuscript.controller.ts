// src/modules/manuscript/manuscript.controller.ts

import { Controller, Post, Body, Request, UseGuards, BadRequestException } from '@nestjs/common'; // Import UseGuards
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ManuscriptService } from './manuscript.service';
import { CreateManuscriptDto } from './dto/create-manuscript.dto';
import { AccessTokenStrategy } from '../auth/strategy/access-token.strategy';
import { Public } from 'src/common/constants/routes.constant';
@ApiTags('manuscripts')
@Controller('manuscripts')
export class ManuscriptController {
  constructor(private readonly manuscriptService: ManuscriptService) {}

  // @UseGuards(AccessTokenStrategy)
  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new manuscript' })
  @ApiCreatedResponse({ description: 'The manuscript has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  async create(@Body() createManuscriptDto: CreateManuscriptDto, @Request() req) {
    try {
      const manuscript = await this.manuscriptService.create(createManuscriptDto,req.user?.userId);
      return manuscript;
    } catch (error) {
      // Handle specific errors here if needed
      throw new BadRequestException('Failed to create manuscript');
    }
  }
}
