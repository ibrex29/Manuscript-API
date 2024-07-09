// src/module/author/author.service.ts

import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma, Author, Reply, Review } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthorDto } from './dtos/create-author.dto';
import * as bcrypt from 'bcrypt';
import { CreateReplyDto } from './dtos/create-reply.dto';
import { UserType } from '../user/types/user.type';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

 
  async createAuthor(createAuthorDto: CreateAuthorDto) {
    const { email, firstName, lastName, password, affiliation, expertiseArea } = createAuthorDto;

    // // Find the author role
    // const roleName = await this.prisma.role.findUnique({
    //   where: { roleName: 'author' }, // Adjust roleName as per your Role enum or database value
    // });

    const roleName= UserType.AUTHOR

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
        email,
        firstName,
        lastName,
        password: hashedPassword,
        createdBy: "",
        updatedBy: " ",
        roles: {
          connect: { id: roleName }, // Connect user to the author role
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

  async getReviewsByAuthor(userId: string): Promise<Review[]> {
    try {
      // Get the author's ID based on the user's ID
      const author = await this.prisma.author.findUnique({
        where: { userId: userId },
      });
  
      if (!author) {
        throw new NotFoundException(`Author with User ID ${userId} not found`);
      }
  
      // Fetch reviews for manuscripts authored by the logged-in author
      return await this.prisma.review.findMany({
        where: {
          Manuscript: {
            authorId: author.id,
          },
        },
        include: {
          Manuscript: {
            include: {
              Author: true,
            },
          },
          Reviewer: {
            include: {
              User: true,
            },
          },
          Author: true,
          Reply: true,
        },
      });
    } catch (error) {
      console.error('Error fetching reviews for the logged-in author:', error);
      throw new InternalServerErrorException('Failed to fetch reviews');
    }
  }

  async createReply(userId: string, createReplyDto: CreateReplyDto): Promise<Reply> {
    const { reviewId, subject, contents, uploadFiles } = createReplyDto;

    try {
      // Get the author's ID based on the user's ID
      const author = await this.prisma.author.findUnique({
        where: { userId: userId },
      });

      if (!author) {
        throw new NotFoundException(`Author with User ID ${userId} not found`);
      }

      // Validate that the review exists
      const review = await this.prisma.review.findUnique({
        where: { id: reviewId },
        include: { Manuscript: true },  // Include the manuscript to check ownership
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${reviewId} not found`);
      }

      // Validate that the manuscript belongs to the author
      if (review.Manuscript.authorId !== author.id) {
        throw new ForbiddenException(`The manuscript for the review is not authored by the logged-in user`);
      }

      // Create the reply
      return await this.prisma.reply.create({
        data: {
          reviewId,
          authorId: author.id,
          subject,
          contents,
          uploadFiles,
        },
      });
    } catch (error) {
      console.error('Error creating reply:', error);

      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create reply');
    }
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
  
}
