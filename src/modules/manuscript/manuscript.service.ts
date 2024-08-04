import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateManuscriptDto } from './dto/create-manuscript.dto';
import { Manuscript, Review, Status } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AssignReviewerDto } from './dto/assign-reviewer.dto';
import { PublishManuscriptDto } from './dto/publish-manuscript.dto';
import { AssignManuscriptToSectionDto } from './dto/assign-manuscript-to-section.dto';
import { ManuscriptDto } from './dto/manuscript.dto';
import { Reviewer } from '../review/entities/reviewer.entity';
import { ReviewerDto } from '../user/dtos/grouped-reviewers.dto';


@Injectable()
export class ManuscriptService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadManuscript(
      createManuscriptDto: CreateManuscriptDto,
      userId: string
    ): Promise<Manuscript> {
      const { title, abstract, keywords, 
              suggestedReviewer, manuscriptLink,
               proofofPayment,otherDocsLink,author,coAuthors } = createManuscriptDto;

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
            coAuthor: coAuthors || '',
            author: author || '',
            // coAuthors,
            suggestedReviewer,
            manuscriptLink,
            proofofPayment,
            otherDocsLink,
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


async assignManuscriptToSection(assignManuscriptToSectionDto: AssignManuscriptToSectionDto) {
  const { manuscriptId, sectionId } = assignManuscriptToSectionDto;

  // Check if the manuscript exists
  const manuscript = await this.prisma.manuscript.findUnique({
    where: { id: manuscriptId },
  });

  if (!manuscript) {
    throw new NotFoundException('Manuscript not found');
  }

  // Update the manuscript to assign it to the section
  const updatedManuscript = await this.prisma.manuscript.update({
    where: { id: manuscriptId },
    data: {
      sectionId: sectionId, // Assign the section ID
    },
  });

  return updatedManuscript;
}

async getManuscriptsForSectionEditor(userId: string): Promise<ManuscriptDto[]> {
  // Find the section editor to get their sectionId
  const sectionEditor = await this.prisma.editor.findUnique({
    where: { userId },
    select: { sectionId: true }, 
  });

  if (!sectionEditor || !sectionEditor.sectionId) {
    throw new NotFoundException('Section editor not found or not assigned to any section');
  }

  const sectionId = sectionEditor.sectionId; 

  // Fetch manuscripts belonging to that section
  const manuscripts = await this.prisma.manuscript.findMany({
    where: { sectionId },
    include: {
      
    },
  });

  return manuscripts; // Return the entire manuscript objects
}

async getReviewersForSectionEditor(userId: string): Promise<ReviewerDto[]> {
  // Find the section editor to get their sectionId
  const sectionEditor = await this.prisma.editor.findUnique({
    where: { userId },
    select: { sectionId: true }, 
  });

  if (!sectionEditor || !sectionEditor.sectionId) {
    throw new NotFoundException('Section editor not found or not assigned to any section');
  }

  const sectionId = sectionEditor.sectionId; 

  // Fetch reviewers belonging to that section
  const reviewers = await this.prisma.reviewer.findMany({
    where: { sectionId },
    include: {
      User: true, // Include user details if necessary
    },
  });

  return reviewers.map(reviewer => ({
    id: reviewer.id,
    userId: reviewer.userId,
    expertiseArea: reviewer.expertiseArea,
    sectionId: reviewer.sectionId,
    user: {
      id: reviewer.User.id,
      email: reviewer.User.email,
      firstName: reviewer.User.firstName,
      lastName: reviewer.User.lastName,
    },
  })); // Return the reviewer objects with necessary details
}


async assignReviewerToManuscript(assignReviewerDto: AssignReviewerDto): Promise<void> {
  const { manuscriptId, reviewerId, reviewDueDate } = assignReviewerDto;

  // Fetch the manuscript to check its section ID
  const manuscript = await this.prisma.manuscript.findUnique({
    where: { id: manuscriptId },
    include: { Section: true }, 
  });

  if (!manuscript) {
    throw new NotFoundException('Manuscript not found');
  }

  // Fetch the reviewer to check their section ID
  const reviewer = await this.prisma.reviewer.findUnique({
    where: { id: reviewerId },
    include: { Section: true }, // Include section details
  });

  if (!reviewer) {
    throw new NotFoundException('Reviewer not found');
  }

  // Ensure both manuscript and reviewer belong to the same section
  if (manuscript.sectionId !== reviewer.sectionId) {
    throw new BadRequestException('Reviewer and manuscript must belong to the same section');
  }
 
      // Assign the manuscript to the reviewer and update the status to UNDER_REVIEW
      const updatedManuscript = await this.prisma.manuscript.update({
        where: { id: manuscriptId },
        data: {
          reviewerId: reviewerId,
          status: 'UNDER_REVIEW',
          assigmentDate: new Date(),
          reviewDueDate : reviewDueDate,
        },
      });

}




  async listSubmittedManuscripts(): Promise<Manuscript[]> {
    try {
      return await this.prisma.manuscript.findMany({
       
      });
    } catch (error) {
      console.error('Error listing submitted manuscripts:', error);
      throw new InternalServerErrorException('Failed to list submitted manuscripts');
    }
  }

  
async getAllAssignedManuscripts() {
const manuscripts = await this.prisma.manuscript.findMany({
  where: { reviewerId: { not: null } },
  include: { Reviewer: true },  
});

return manuscripts;
}


async getAllUnassignedManuscripts() {
const manuscripts = await this.prisma.manuscript.findMany({
  where: { reviewerId: null },
});

return manuscripts;
}

async getManuscriptDetails(manuscriptId: string) {

const manuscript = await this.prisma.manuscript.findUnique({
  where: { id: manuscriptId },
  include: {
    Author: true,  
    Reviewer: {    
      include: {
        User: true  
      }
    },
    Review: {      
      include: {
        Reviewer: {
          include: {
            User: true  
          }
        }
      }
    }
  }
});

if (!manuscript) {
  throw new NotFoundException(`Manuscript with ID ${manuscriptId} not found`);
}

return manuscript;
}


async getManuscriptsByStatus(status: Status): Promise<{ count: number; manuscripts: Manuscript[] }> {
  const manuscripts = await this.prisma.manuscript.findMany({
    where: { status: status },
  });
  const count = manuscripts.length;
  return { count, manuscripts };
}



async countAssignedManuscripts() {
  return this.prisma.manuscript.count({
    where: {
      reviewerId: {
        not: null,
      },
    },
  });
}

async countUnassignedManuscripts() {
  return this.prisma.manuscript.count({
    where: {
      reviewerId: null,
    },
  });
}

async countPublishedManuscripts() {
  return this.prisma.manuscript.count({
    where: {
      isPublished: true,
    },
  });

}
async countSubmittedManuscript() {
  return this.prisma.manuscript.count();
}

async countApprovedManuscript() {
  return this.prisma.manuscript.count({
    where:{
      status:"ACCEPTED"
    }
  });
}


async getStatistics() {
  const [assignedManuscriptCount, unassignedManuscriptCount, publishedManuscriptCount ,submittedManuscriptcount,approvedManuscriptCount] = await Promise.all([
    this.countAssignedManuscripts(),
    this.countUnassignedManuscripts(),
    this.countPublishedManuscripts(),
    this.countSubmittedManuscript(),
    this.countApprovedManuscript()
  ]);

  return {
    assignedManuscripts: assignedManuscriptCount,
    unassignedManuscripts: unassignedManuscriptCount,
    publishedManuscripts: publishedManuscriptCount,
    submittedManuscriptcount :submittedManuscriptcount,
    approvedManuscriptCount: approvedManuscriptCount
  };
}


async publishManuscript(publishManuscriptDto: PublishManuscriptDto, userId: string) {
  const { manuscriptId, title, abstract, keywords, formattedManuscript } = publishManuscriptDto;
  
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
      userId: userId,
      formartedManuscript: formattedManuscript ,
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
      formartedManuscript: true,
      manuscriptId: true,
    },
  });

  return publishedManuscripts;
}

}
