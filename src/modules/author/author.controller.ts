// src/module/author/author.controller.ts

import { Controller, Get, Post, Put, Delete, Param, Body, Version, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthorService } from './author.service';
import { Prisma, Author } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiBody } from '@nestjs/swagger';
import { CreateAuthorDto } from './dtos/create-author.dto';
import { Public } from 'src/common/constants/routes.constant';

@ApiBearerAuth() // Optional: If you are using authentication
@ApiTags('author')
@Controller({ path: 'author', version: '1' }) // Versioning with v1
export class AuthorController {
  constructor(private authorService: AuthorService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new author' })
  @ApiCreatedResponse({ description: 'The author has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  @ApiBody({ type: CreateAuthorDto })
  async createAuthor(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorService.createAgent(createAuthorDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all authors' })
  @ApiOkResponse({ description: 'The list of authors has been successfully retrieved.' })
  async getAllAuthors(){
    return this.authorService.getAllAuthors();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get author by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Author ID' })
  @ApiOkResponse({ description: 'Author found.' })
  @ApiNotFoundResponse({ description: 'Author not found.' })
  async getAuthorById(@Param('id') id: string): Promise<Author | null> {
    return this.authorService.getAuthorById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing author by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Author ID' })
  @ApiOkResponse({ description: 'Author updated.' })
  @ApiNotFoundResponse({ description: 'Author not found.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  async updateAuthor(@Param('id') id: string, @Body() data: Prisma.AuthorUpdateInput): Promise<Author> {
    return this.authorService.updateAuthor(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete author by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Author ID' })
  @ApiOkResponse({ description: 'Author deleted.' })
  @ApiNotFoundResponse({ description: 'Author not found.' })
  async deleteAuthor(@Param('id') id: string): Promise<Author> {
    return this.authorService.deleteAuthor(id);
  }
}
