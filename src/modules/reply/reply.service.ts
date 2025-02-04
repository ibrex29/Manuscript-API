// src/module/author/author.service.ts

import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Reply, Review } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateReplyDto } from './dto/reply.dto';

@Injectable()
export class ReplyService {
  constructor(private prisma: PrismaService) {}

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
        // include: {
          // Manuscript: {
          //   include: {
          //     Author: true,
          //   },
          // },
          // Reviewer: {
          //   include: {
          //     User: true,
          //   },
          // },
          // Author: true,
          // Reply: true,
        // },
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
}