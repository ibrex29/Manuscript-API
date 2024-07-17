import { Controller, Get, Post, Put, Delete, Param, Body, Version, HttpStatus, HttpCode, Request, UseGuards, HttpException } from '@nestjs/common';
import { EditorService } from './editor.service';
import { Editor, Manuscript, Status } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse, ApiBody } from '@nestjs/swagger';
import { Public, Role } from 'src/common/constants/routes.constant';
import { CreateEditorDto } from './dtos/create-editor.dto';
import { AssignReviewerDto } from './dtos/assign-reviewer.dto';
import { UserType } from '../user/types/user.type';
import { RolesGuard } from '../auth/guard/role.guard';
import { AssignRoleByNameDto } from './dtos/assign-role-by-name.dto';
import { PublishManuscriptDto } from './dtos/publish-manuscript.dto';
import { CreateReviewerDto } from '../reviewer/dto/create-reviewer.dto';


@ApiBearerAuth() 
@ApiTags('editor')
@UseGuards(RolesGuard)
@Controller({ path: 'editor', version: '1' }) 
export class EditorController {
  constructor(private editorService: EditorService) {}

  @Public()
  @Post("editor")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new editor' })
  @ApiCreatedResponse({ description: 'The editor has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiBody({ type: CreateEditorDto })
  async createAuthor(@Body() createEditorDto: CreateEditorDto): Promise<Editor> {
    return this.editorService.createEditor(createEditorDto);
  }

  @Role(UserType.EDITOR)
  @Post("reviewer")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reviewer' })
  create(@Body() createReviewerDto: CreateReviewerDto) {
    return this.editorService.createReviewer(createReviewerDto);
  }
  
  // @Public()
  @Post('assign-reviewer')
  @Role(UserType.EDITOR)  
  @ApiOperation({ summary: 'Assign a reviewer to a manuscript' })
  @ApiCreatedResponse({ description: 'The reviewer has been successfully assigned to the manuscript.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided or reviewer already assigned.' })
  async assignReviewer(@Body() assignReviewerDto: AssignReviewerDto) {
    return this.editorService.assignManuscriptToReviewer(assignReviewerDto);
  }


  // @Public()
  @Role(UserType.EDITOR) 
  @Get("list-all-authors")
  @ApiOperation({ summary: 'Get all authors' })
  @ApiOkResponse({ description: 'The list of authors has been successfully retrieved.' })
  async getAllAuthors(){
    return this.editorService.getAllAuthors();
  }

  // @Public()
  @Role(UserType.EDITOR) 
  @Get('')
  @ApiOperation({ summary: 'Find all reviewers' })
  findAll() {
    return this.editorService.getAllReviewers();
  }

  // @Public()
  @Role(UserType.EDITOR) 
  @Get('submitted')
  @ApiOperation({ summary: 'List all submitted manuscripts' })
  async listSubmitted(): Promise<Manuscript[]> {
    return this.editorService.listSubmittedManuscripts();
  }

  @Role(UserType.EDITOR)
  // @Public()
  @Get('assigned')
  @ApiOperation({ summary: 'Get all assigned manuscripts' })
  async getAllAssignedManuscripts() {
    return this.editorService.getAllAssignedManuscripts();
  }

  
  // @Public()
  @Role(UserType.EDITOR)
  @Get('unassigned')
  @ApiOperation({ summary: 'Get all unassigned manuscripts' })
  async getAllUnassignedManuscripts() {
    return this.editorService.getAllUnassignedManuscripts();
  }

  @Get(':manuscriptId/details')
  @Role(UserType.EDITOR)
  @ApiOperation({ summary: 'Get manuscript details with author, assigned reviewer, and reviews' })
  async getManuscriptDetails(@Param('manuscriptId') manuscriptId: string) {
    return this.editorService.getManuscriptDetails(manuscriptId);
  }
  
  // @Public()
  @Get('status/:status')
  @Role(UserType.EDITOR)
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
  // @Public()
  @Get("stat")
  @Role(UserType.EDITOR)
  async getStatistics() {
    return this.editorService.getStatistics();
  }


  @Post('assign-role-by-name')
  @Role(UserType.EDITOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a role to a user by role name' })
  @ApiCreatedResponse({ description: 'The role has been successfully assigned to the user.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiBody({ type: AssignRoleByNameDto })
  async assignRoleByName(@Body() assignRoleByNameDto: AssignRoleByNameDto) {
    try {
      return await this.editorService.assignRoleByName(assignRoleByNameDto);
    } catch (error) {
      console.error('Error in assignRoleByName controller:', error);
      throw new HttpException('Could not assign role.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Post('publish')
  @Role(UserType.EDITOR)  
  @ApiOperation({ summary: 'Publish a manuscript' })
  @ApiResponse({ status: 200, description: 'Manuscript published successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or manuscript status not ACCEPTED.' })
  async publishManuscript(
  @Request() req,
  @Body() publishManuscriptDto: PublishManuscriptDto) {
    return this.editorService.publishManuscript(publishManuscriptDto, req.user?.userId);
  }

  @Public()
  @Get('manuscripts/published')
  async getAllPublishedManuscripts() {
    return this.editorService.getAllPublishedManuscripts();
  }
  
}
