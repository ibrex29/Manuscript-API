import { Controller, Get, Post, Put, Delete, Param, Body, Version, HttpStatus, HttpCode, Request, UseGuards } from '@nestjs/common';
import { EditorService } from './editor.service';
import { Prisma, Author, Editor, Manuscript, Status } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBody } from '@nestjs/swagger';

import { Public, Role } from 'src/common/constants/routes.constant';
import { CreateEditorDto } from './dtos/create-editor.dto';
import { AssignReviewerDto } from './dtos/assign-reviewer.dto';
import { UserType } from '../user/types/user.type';
import { RolesGuard } from '../auth/guard/role.guard';

@ApiBearerAuth() 
@ApiTags('editor')
@UseGuards(RolesGuard)

@Controller({ path: 'editor', version: '1' }) // Versioning with v1
export class EditorController {
  constructor(private editorService: EditorService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new editor' })
  @ApiCreatedResponse({ description: 'The editor has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiBody({ type: CreateEditorDto })
  async createAuthor(@Body() createAuthorDto: CreateEditorDto): Promise<Editor> {
    return this.editorService.createAuthor(createAuthorDto);
  }

  @Post('assign-reviewer')
  @Role(UserType.EDITOR)  
  @ApiOperation({ summary: 'Assign a reviewer to a manuscript' })
  @ApiCreatedResponse({ description: 'The reviewer has been successfully assigned to the manuscript.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided or reviewer already assigned.' })
  async assignReviewer(@Body() assignReviewerDto: AssignReviewerDto) {
    return this.editorService.assignManuscriptToReviewer(assignReviewerDto);
  }


  @Public()
  @Get("list-all-authors")
  @ApiOperation({ summary: 'Get all authors' })
  @ApiOkResponse({ description: 'The list of authors has been successfully retrieved.' })
  async getAllAuthors(){
    return this.editorService.getAllAuthors();
  }

  @Public()
  @Get('submitted')
  @ApiOperation({ summary: 'List all submitted manuscripts' })
  async listSubmitted(): Promise<Manuscript[]> {
    return this.editorService.listSubmittedManuscripts();
  }

  // @Role(UserType.EDITOR)
  @Public()
  @Get('assigned')
  @ApiOperation({ summary: 'Get all assigned manuscripts' })
  async getAllAssignedManuscripts() {
    return this.editorService.getAllAssignedManuscripts();
  }

  // @Role(UserType.EDITOR)
  @Public()
  @Get('unassigned')
  @ApiOperation({ summary: 'Get all unassigned manuscripts' })
  async getAllUnassignedManuscripts() {
    return this.editorService.getAllUnassignedManuscripts();
  }

  @Role(UserType.EDITOR)
  @Get(':manuscriptId/details')
  @ApiOperation({ summary: 'Get manuscript details with author, assigned reviewer, and reviews' })
  async getManuscriptDetails(@Param('manuscriptId') manuscriptId: string) {
    return this.editorService.getManuscriptDetails(manuscriptId);
  }
  
  @Public()
  @Get('status/:status')
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
    return this.editorService.getManuscriptsByStatus(status);
  }
  @Public()
  @Get("stat")
  async getStatistics() {
    return this.editorService.getStatistics();
  }

}
