// src/module/author/author.controller.ts

import { Controller, Get, Post, Put, Delete, Param, Body, Version, HttpStatus, HttpCode ,Request, UseGuards} from '@nestjs/common';
import { AuthorService } from './author.service';
import { Prisma, Author, Review } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBody } from '@nestjs/swagger';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { Public, Role } from 'src/common/constants/routes.constant';
import { UserType } from '../user/types/user.type';
import { CreateReplyDto } from './dtos/create-reply.dto';
import { RolesGuard } from '../auth/guard/role.guard';

@ApiBearerAuth() 
@ApiTags('author')
@UseGuards(RolesGuard)
@Controller({ path: 'author', version: '1' }) 
export class AuthorController {
  constructor(private authorService: AuthorService) {}


  @Public()
  @Post("author")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new author' })
  @ApiCreatedResponse({ description: 'The author has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiBody({ type: CreateAuthorDto })
  async createAuthor(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorService.createAuthor(createAuthorDto);
  }

  @Role(UserType.AUTHOR)
  @Get('Sumitted-Manuscript')
  @ApiOperation({ summary: 'Get all manuscript submitted by logged in author' })
  async getSubmittedManuscriptsForLoggedInUser(
    @Request() req) {
    return this.authorService.getSubmittedManuscriptsForLoggedInUser(req.user?.userId);
  }



  // @Get(':id')
  // @ApiOperation({ summary: 'Get author by ID' })
  // @ApiParam({ name: 'id', type: String, description: 'Author ID' })
  // @ApiOkResponse({ description: 'Author found.' })
  // @ApiNotFoundResponse({ description: 'Author not found.' })
  // async getAuthorById(@Param('id') id: string): Promise<Author | null> {
  //   return this.authorService.getAuthorById(id);
  // }

  // @Put(':id')
  // @ApiOperation({ summary: 'Update an existing author by ID' })
  // @ApiParam({ name: 'id', type: String, description: 'Author ID' })
  // @ApiOkResponse({ description: 'Author updated.' })
  // @ApiNotFoundResponse({ description: 'Author not found.' })
  // @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  // async updateAuthor(@Param('id') id: string, @Body() data: Prisma.AuthorUpdateInput): Promise<Author> {
  //   return this.authorService.updateAuthor(id, data);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete author by ID' })
  // @ApiParam({ name: 'id', type: String, description: 'Author ID' })
  // @ApiOkResponse({ description: 'Author deleted.' })
  // @ApiNotFoundResponse({ description: 'Author not found.' })
  // async deleteAuthor(@Param('id') id: string): Promise<Author> {
  //   return this.authorService.deleteAuthor(id);
  // }
  
  // @Get('my-reviews')
  // @Role(UserType.AUTHOR)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get reviews for manuscripts authored by the logged-in user' })
  // @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  // async getReviewsForLoggedInAuthor(
  //   @Request() req) {
  //   return this.authorService.getReviewsForLoggedInAuthor(req.user?.userId);
  // }




 @Role(UserType.AUTHOR)
  @Get('status-counts')
  async getManuscriptCounts( @Request() req){
    return this.authorService.getManuscriptCountsForAuthor(req.user?.userId);
  }

}
