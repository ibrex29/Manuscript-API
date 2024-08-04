// src/module/author/author.service.ts

import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, Author, Reply, Review } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthorDto } from './dtos/create-author.dto';
import * as bcrypt from 'bcrypt';
import { UserType } from '../user/types/user.type';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

 
  async createAuthor(createAuthorDto: CreateAuthorDto) {
    const { title,email, firstName, lastName, password, affiliation, expertiseArea } = createAuthorDto;

    // Find the author role
    const roleName = await this.prisma.role.findUnique({
      where: { roleName: UserType.AUTHOR }, 
    });

    if (!roleName) {
      throw new ConflictException('Author role not found');
    }

    // Check if the email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email address already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user and author profile
    const createdUser = await this.prisma.user.create({
      data: {
        title,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        createdBy: "",
        updatedBy: " ",
        roles: {
          connect: { id: roleName.id }, 
        },
      },
    });

    // Create the author profile
    const createdAuthor = await this.prisma.author.create({
      data: {
        userId: createdUser.id,
        affiliation,
        expertiseArea,
      },
    });

    return createdAuthor;
  }

  async getAuthorById(id: string): Promise<Author | null> {
    return this.prisma.author.findUnique({ where: { id } });
  }

  async updateAuthor(id: string, data: Prisma.AuthorUpdateInput): Promise<Author> {
    return this.prisma.author
    .update({ where: { id }, data });
  }

  async deleteAuthor(id: string): Promise<Author> {
    return this.prisma.author.delete({ where: { id } });
  }

  // Get all submitted manuscripts by a particular author
  async getSubmittedManuscriptsByAuthor(authorId: string) {
    // Get all submitted manuscripts by the author
    const manuscripts = await this.prisma.manuscript.findMany({
      where: {
        authorId: authorId,
        status: 'SUBMITTED',  // Assuming 'SUBMITTED' is the status for submitted manuscripts
      },
    });

    if (!manuscripts.length) {
      throw new NotFoundException(`No submitted manuscripts found for author with ID ${authorId}`);
    }

    return manuscripts;
  }

  // New method to get all submitted manuscripts for the logged-in user
  async getSubmittedManuscriptsForLoggedInUser(
    userId: string) {
    // Get the author's ID based on the user's ID
    const author = await this.prisma.author.findUnique({
      where: { userId: userId },
    });

    if (!author) {
      throw new NotFoundException(`Author with User ID ${userId} not found`);
    }

    return this.getSubmittedManuscriptsByAuthor(author.id);
  }


  async getManuscriptCountsForAuthor(userId: string) {
    
    // Validate if the user is an author
    const author = await this.prisma.author.findUnique({
      where: { userId },
    });

    if (!author) {
      throw new UnauthorizedException('User is not an author');
    }

    const submittedCount = await this.prisma.manuscript.count({
      where: {
        authorId: author.id,
        status: 'SUBMITTED',
      },
    });

    const underReviewCount = await this.prisma.manuscript.count({
      where: {
        authorId: author.id,
        status: 'UNDER_REVIEW',
      },
    });

    const acceptedCount = await this.prisma.manuscript.count({
      where: {
        authorId: author.id,
        status: 'ACCEPTED',
      },
    });

    const rejectedCount = await this.prisma.manuscript.count({
      where: {
        authorId: author.id,
        status: 'REJECTED',
      },
    });

    const publishedCount = await this.prisma.manuscript.count({
      where: {
        authorId: author.id,
        status: 'PUBLISHED',
      },
    });

    return {
      submittedCount,
      underReviewCount,
      acceptedCount,
      rejectedCount,
      publishedCount,
    };
  }

  
  
}
