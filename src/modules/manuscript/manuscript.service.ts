import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateManuscriptDto } from './dto/create-manuscript.dto';
import { Manuscript } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

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
        include: { author: true },
      });

      if (!userWithAuthor) {
        throw new BadRequestException('User does not exist');
      }

      if (!userWithAuthor.author) {
        throw new BadRequestException('User is not an author');
      }

      // Retrieve the author ID
      const authorId = userWithAuthor.author.id;

      // Create the manuscript
      const manuscript = await this.prisma.manuscript.create({
        data: {
          title,
          abstract,
          keywords,
          suggestedReviewer,
          manuscriptLink,
          proofofPayment,
          authorId: authorId,
          createdAt: new Date(),
          createdBy: userId,
          updatedAt: new Date(),
          updatedBy: userId,
          status: 'SUBMITTED',
        },
      });

      return manuscript;
    } catch (error) {
      console.error('Error creating manuscript:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create manuscript');
    }
  }
}
