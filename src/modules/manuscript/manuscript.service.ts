import { Injectable } from '@nestjs/common';
import { CreateManuscriptDto } from './dto/create-manuscript.dto';
import { Manuscript } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';


@Injectable()
export class ManuscriptService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createManuscriptDto: CreateManuscriptDto, userId: string): Promise<Manuscript> {
    const { title, abstract, keywords, suggestedReviewer, manuscriptLink, proofofPayment } = createManuscriptDto;
    const createdAt = new Date();
    const x= "36e180ca-0723-48e8-a95a-3940ee68850a"
    try {
      const manuscript = await this.prisma.manuscript.create({
        data: {
          title,
          abstract,
          keywords,
          suggestedReviewer,
          manuscriptLink,
          proofofPayment,
          authorId: userId,
          createdAt,
          createdBy:userId,
          updatedAt: new Date(),
          updatedBy: userId,
          status: "SUBMITTED"
        },
      });

      return manuscript;
    } catch (error) {
      console.error('Error creating manuscript:', error);
      throw new Error('Failed to create manuscript'); // Example of generic error handling, adjust as per your needs
    }
  }
}
