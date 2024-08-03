// src/modules/manuscript/manuscript.controller.ts

import { Controller, Post, Body, Request,Patch, UseGuards, Get, Param, HttpCode, HttpException, HttpStatus } from '@nestjs/common'; 
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ManuscriptService } from './manuscript.service';
import { CreateManuscriptDto } from './dto/create-manuscript.dto';
import { RolesGuard } from '../auth/guard/role.guard';
import { UserType } from '../user/types/user.type';
import { Public, Role} from 'src/common/constants/routes.constant'
import { Manuscript, Status } from '@prisma/client';
import { AssignReviewerDto } from './dto/assign-reviewer.dto';
import { PublishManuscriptDto } from './dto/publish-manuscript.dto';
import { AssignManuscriptToSectionDto } from './dto/assign-manuscript-to-section.dto';
// import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ManuscriptDto } from './dto/manuscript.dto';
import { ReviewerDto } from '../user/dtos/grouped-reviewers.dto';


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

 @Role(UserType.EDITOR_IN_CHIEF)
  @Patch('assign-section')
  @ApiOperation({ summary: 'Assign manuscript to a section by editor in chief' })
  @ApiResponse({
    status: 200,
    description: 'Manuscript assigned to section successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Manuscript not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  async assignManuscriptToSection(
    @Body() assignManuscriptToSectionDto: AssignManuscriptToSectionDto,
    @Request() req // You can use this if you need to access the user's info
  ) {
    return this.manuscriptService.assignManuscriptToSection(assignManuscriptToSectionDto);
  }

  @Role(UserType.SECTION_EDITOR)
  @ApiOperation({ summary: 'Get manuscript for logged in section editor' })
  @Get('section-editor')
  async getManuscriptsForSectionEditor(
    @Request() req): Promise<ManuscriptDto[]> {
    // const userId = req.user.id; // Assuming the user's ID is available in req.user
    return this.manuscriptService.getManuscriptsForSectionEditor( req.user?.userId);
  }

  @Role(UserType.SECTION_EDITOR)
  @Get('reviewers-for-section-editor')
  @ApiOperation({ summary: 'Get reviewers for the logged-in section editor' })
  @ApiResponse({ status: 200, description: 'Reviewers fetched successfully' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getReviewersForSectionEditor( @Request() req):Promise<ReviewerDto[]> {
    return this.manuscriptService.getReviewersForSectionEditor(req.user?.userId);
  }
  
  @Role(UserType.SECTION_EDITOR)
  @Patch('assign-reviewer')
  @ApiOperation({ summary: 'Assign manuscript to a reviewer by section editor' })
  @ApiResponse({ status: 200, description: 'Reviewer assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async assignReviewerToManuscript(@Body() assignReviewerDto: AssignReviewerDto): Promise<void> {
    return this.manuscriptService.assignReviewerToManuscript(assignReviewerDto);
  }


  
  @Public()
  @Get('submitted')
  @ApiOperation({ summary: 'List all submitted manuscripts' })
  async listSubmitted(): Promise<Manuscript[]> {
    return this.manuscriptService.listSubmittedManuscripts();
  }


  // @Public()
  // @Post('assign-reviewer')
  // // @Role(UserType.EDITOR)  
  // @ApiOperation({ summary: 'Assign a reviewer to a manuscript' })
  // @ApiCreatedResponse({ description: 'The reviewer has been successfully assigned to the manuscript.' })
  // @ApiBadRequestResponse({ description: 'Invalid data provided or reviewer already assigned.' })
  // async assignReviewer(@Body() assignReviewerDto: AssignReviewerDto) {
  //   return this.manuscriptService.assignManuscriptToReviewer(assignReviewerDto);
  // }

  // @Role(UserType.EDITOR)
  @Public()
  @Get('assigned')
  @ApiOperation({ summary: 'Get all assigned manuscripts' })
  async getAllAssignedManuscripts() {
    return this.manuscriptService.getAllAssignedManuscripts();
  }

  
  @Public()
  @Get('unassigned')
  @ApiOperation({ summary: 'Get all unassigned manuscripts' })
  async getAllUnassignedManuscripts() {
    return this.manuscriptService.getAllUnassignedManuscripts();
  }

  @Get(':manuscriptId/details')
  @Role(UserType.EDITOR_IN_CHIEF,UserType.SECTION_EDITOR)
  @ApiOperation({ summary: 'Get manuscript details with author, assigned reviewer, and reviews' })
  async getManuscriptDetails(@Param('manuscriptId') manuscriptId: string) {
    return this.manuscriptService.getManuscriptDetails(manuscriptId);
  }
  
  // @Public()
  @Get('status/:status')
  @Role(UserType.EDITOR_IN_CHIEF,UserType.SECTION_EDITOR)
  @ApiOperation({ summary: 'Get manuscripts by status' })
  @ApiResponse({
    status: 200,
    description: 'Manuscripts retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async getManuscriptsByStatus(@Param('status') status: Status) {
    return this.manuscriptService.getManuscriptsByStatus(status);
  }
  @Public()
  @ApiOperation({ summary: 'Get statistics of manuscripts ' })
  @ApiResponse({
    status: 200,
    description: 'Manuscripts stats retreived  successfully.',
  })

  @Get("analytics")
  // @Role(UserType.EDITOR)
  async getStatistics() {
    return this.manuscriptService.getStatistics();
  }

  @Post('publish')
  @Role(UserType.EDITOR_IN_CHIEF,UserType.PRODUCTION_EDITOR)
  @ApiOperation({ summary: 'Publish a manuscript' })
  @ApiResponse({ status: 200, description: 'Manuscript published successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or manuscript status not ACCEPTED.' })
  async publishManuscript(
  @Request() req,
  @Body() publishManuscriptDto: PublishManuscriptDto) {
    return this.manuscriptService.publishManuscript(publishManuscriptDto, req.user?.userId);
  }

  @Public()
  @ApiOperation({ summary: 'list of Published manuscripts ' })
  @ApiResponse({
    status: 200,
    description: 'Published Manuscripts retreived  successfully.',
  })
  @Get('manuscripts/published')
  async getAllPublishedManuscripts() {
    return this.manuscriptService.getAllPublishedManuscripts();
  }


}