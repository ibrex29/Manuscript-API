// src/modules/manuscript/manuscript.controller.ts

import { Controller, Post, Body, Request, UseGuards, Get, Param } from '@nestjs/common'; 
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ManuscriptService } from './manuscript.service';
import { CreateManuscriptDto } from './dto/create-manuscript.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { UserType } from '../user/types/user.type';
import { Public, Role} from 'src/common/constants/routes.constant'
import { Manuscript } from '@prisma/client';
import { AssignReviewerDto } from './dto/assign-reviewer.dto';

@ApiTags('manuscripts')
@ApiBearerAuth()
@Controller('manuscripts')
@UseGuards(RolesGuard)
export class ManuscriptController {
  constructor(private readonly manuscriptService: ManuscriptService) {}

  @Post()
  @Role(UserType.AUTHOR)
  @ApiOperation({ summary: 'Create a new manuscript' })
  @ApiCreatedResponse({ description: 'The manuscript has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  async create(
    @Request() req,
    @Body() createManuscriptDto: CreateManuscriptDto,
  ) {
    return this.manuscriptService.uploadManuscript(
      createManuscriptDto,
      req.user?.userId)
  }

  
  @Public()
  @Get('assigned-manuscript/:reviewerId')
  @ApiOperation({ summary: 'Get manuscripts assigned to a specific reviewer' })
  async getReviewerWithManuscripts(@Param('reviewerId') reviewerId: string) {
    return this.manuscriptService.getReviewerWithManuscripts(reviewerId);
  }

}