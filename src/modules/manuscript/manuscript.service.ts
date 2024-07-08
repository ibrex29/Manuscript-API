import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateManuscriptDto } from './dto/create-manuscript.dto';
import { Manuscript, Review } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AssignReviewerDto } from './dto/assign-reviewer.dto';

@Injectable()
export class ManuscriptService {
  constructor(private readonly prisma: PrismaService) {}
  async uploadManuscript(
    createManuscriptDto: CreateManuscriptDto,
    userId: string
  ): Promise<Manuscript> {
    const { title, abstract, keywords, suggestedReviewer, manuscriptLink, proofofPayment } = createManuscriptDto;

    try {
      // Check if the user exists and is an author
      const userWithAuthor = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { Author: true },
      });

      if (!userWithAuthor?.Author) {
        throw new BadRequestException('User does not exist or is not an author');
      }

      // Retrieve the author ID
      const authorId = userWithAuthor.Author.id;

      // Create the manuscript
      const manuscript = await this.prisma.manuscript.create({
        data: {
          title,
          abstract,
          keywords,
          suggestedReviewer,
          manuscriptLink,
          proofofPayment,
          authorId,
          status: 'SUBMITTED',
          isPublished: false,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      return manuscript;
    } catch (error) {
      console.error('Error creating manuscript:', error);

      // If it's a specific Prisma error or another exception, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create manuscript');
    }
  }


    // New method to get a reviewer with their manuscripts
  async getReviewerWithManuscripts(reviewerId: string) {
    // Find the reviewer with their manuscripts
    const reviewer = await this.prisma.reviewer.findUnique({
      where: { id: reviewerId },
      include: { Manuscript: true }   
      });
      if (!reviewer) {
        throw new NotFoundException(`Reviewer with ID ${reviewerId} not found`);
      }
      return reviewer;
}

 

}