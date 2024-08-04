import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PublishManuscriptDto } from './dto/publish-manuscript.dto';
import { Manuscript } from '@prisma/client';

@Injectable()
export class PublicationService {
    constructor(private readonly prisma: PrismaService) {}

    async getAcceptedManuscripts(): Promise<Manuscript[]> {
        return this.prisma.manuscript.findMany({
          where: {
            status: 'ACCEPTED', // Replace with the actual enum or string value for 'ACCEPTED'
          },
        });
      }

    async publishManuscript(publishManuscriptDto: PublishManuscriptDto, userId: string) {
        const { manuscriptId, title, abstract, keywords,issue,volume,doi, formattedManuscript } = publishManuscriptDto;
        
        // Fetch the manuscript to check its status
        const manuscript = await this.prisma.manuscript.findUnique({
          where: { id: manuscriptId }
        });
      
        if (!manuscript) {
          throw new BadRequestException('Manuscript not found');
        }
      
        if (manuscript.status !== 'ACCEPTED') {
          throw new BadRequestException('Manuscript status must be ACCEPTED By reviewer to be published');
        }
      
        // Update manuscript status to published
        const updatedManuscript = await this.prisma.manuscript.update({
          where: { id: manuscriptId },
          data: {
            status: 'PUBLISHED',
            isPublished: true,
            updatedAt: new Date(),
            updatedBy: userId
          }
        });
      
        await this.prisma.publication.create({
          data: {
            title: title,
            abstract: abstract,
            keywords: keywords,
            issue:issue,
            volume:volume,
            DOI:doi,
            userId: userId,
            formattedManuscript: formattedManuscript ,
            manuscriptId: manuscriptId
          }
        });
      
        return updatedManuscript;
      }
      

async getAllPublishedManuscripts() {
    const publishedManuscripts = await this.prisma.publication.findMany({
      where: {
        Manuscript: {
          status: 'PUBLISHED',
        },
      },
      select: {
        id: true,
        title: true,
        abstract: true,
        keywords: true,
        userId: true,
        formattedManuscript: true,
        manuscriptId: true,
      },
    });
  
    return publishedManuscripts;
  }
  
}
