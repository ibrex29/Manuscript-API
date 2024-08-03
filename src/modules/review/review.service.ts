import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReviewerDto } from '../user/dtos/create-reviewer.dto';
import { UpdateReviewerDto } from '../user/dtos/update-reviewer.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Recommendation, Reply, Review, Reviewer, Status } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { AcceptRejectManuscriptDto } from './dto/accept-reject-manuscript.dto';


@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

//   async createReviewer(createReviewerDto: CreateReviewerDto) {
//     const { email, firstName, lastName, password,expertiseArea } = createReviewerDto;

//     // Find the author role
//     const reviewerRole = await this.prisma.role.findUnique({
//       where: { roleName: 'reviewer' }, 
//     });

//     if (!reviewerRole) {
//       throw new ConflictException('Author role not found');
//     }

//     // Check if the email already exists
//     const existingUser = await this.prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       throw new ConflictException('Email address already exists');
//     }
//      // Hash the password
//      const hashedPassword = await bcrypt.hash(password, 10);


//     // Create the user and author profile
//     const createdUser = await this.prisma.user.create({
//       data: {
//         email,
//         firstName,
//         lastName,
//         createdBy : "",
//         createdAt: new Date().toISOString(),
//         updatedBy: " ",
//         password:hashedPassword,
//         roles: {
//           connect: { id: reviewerRole.id }, // Connect user to the author role
//         },
//       },
//     });

//     // Create the author profile
//     const createdreviewer = await this.prisma.reviewer.create({
//       data: {
//         userId: createdUser.id,
//         expertiseArea,
//       },
//     });

//     return createdreviewer;
// }

  async findOne(id: string): Promise<Reviewer> {
    try {
      // Fetch the reviewer by ID
      const reviewer = await this.prisma.reviewer.findUnique({
        where: { id },
        include: { User: true }, // Include related user information if needed
      });

      if (!reviewer) {
        throw new NotFoundException(`Reviewer with id ${id} not found`);
      }

      return reviewer;
    } catch (error) {
      console.error('Error fetching reviewer:', error);
      throw new InternalServerErrorException('Failed to fetch reviewer');
    }
  }

  // New method to get all manuscripts assigned to a specific reviewer
  async getManuscriptsAssignedToReviewer(reviewerId: string) {
    // Fetch manuscripts assigned to the reviewer
    const manuscripts = await this.prisma.reviewer.findUnique({
      where: { id: reviewerId },
      include: { Manuscript: true },  // Include manuscripts assigned to the reviewer
    });

    if (!manuscripts) {
      throw new NotFoundException(`Reviewer with ID ${reviewerId} not found`);
    }

    return manuscripts.Manuscript;  // Return the manuscripts assigned to the reviewer
  }

 // New method to get a reviewer with their manuscripts
 async getReviewerWithManuscripts(reviewerId: string) {
  // Find the reviewer with their manuscripts
  const reviewer = await this.prisma.reviewer.findUnique({
    where: { id: reviewerId },
    include: { Manuscript: true }
    ,
  });

  if (!reviewer) {
    throw new NotFoundException(`Reviewer with ID ${reviewerId} not found`);
  }

  return reviewer;
}

// New method to get all submitted manuscripts for the logged-in user
async getManuscriptsAssignedForLoggedInUser(
  userId: string) {
  // Get the author's ID based on the user's ID
  const reviewer = await this.prisma.reviewer.findUnique({
    where: { userId: userId },
  });

  if (!reviewer) {
    throw new NotFoundException(`Reviewer with User ID ${userId} not found`);
  }

  return this.getReviewerWithManuscripts(reviewer.id);
}

// New method to get reviewer ID for the logged-in user
async getReviewerIdForLoggedUser(userId: string) {
  const reviewer = await this.prisma.reviewer.findUnique({
    where: { userId: userId },
  });

  if (!reviewer) {
    throw new NotFoundException(`Reviewer with User ID ${userId} not found`);
  }

  return reviewer.id;
}

async createReview(userId: string, createReviewDto: CreateReviewDto) {
  const { manuscriptId, comments, recommendation } = createReviewDto;
  
  // Get the reviewer's ID based on the user's ID
  const reviewerId = await this.getReviewerIdForLoggedUser(userId);
 
  // Validate that the manuscript is assigned to this reviewer
  const manuscript = await this.prisma.manuscript.findFirst({
    where: { id: manuscriptId, reviewerId: reviewerId },
  });
  if (!manuscript) {
    throw new ForbiddenException(`Manuscript with ID ${manuscriptId} is not assigned to this reviewer`);
  }

  // Create review
  return this.prisma.review.create({
    data: {
      manuscriptId,
      reviewerId: reviewerId,
      reviewDate: new Date(),
      comments,
      recommendation,
      authorId: manuscript.authorId, 
    },
  });
}

async getAllReviews(): Promise<Review[]> {
  try {
    return await this.prisma.review.findMany({
      include: {
        Manuscript: {
          include: {
            Author: true,  // Include the Author associated with the Manuscript
          },
        },
        Reviewer: {
          include: {
            User: true,  // Include the User associated with the Reviewer
          },
        },
        Author: true,  // Include the Author associated with the Review
        Reply: true,   // Include all replies associated with the review
      },
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    throw new InternalServerErrorException('Failed to fetch reviews');
  }
}
async getRepliesForReview(reviewId: string): Promise<Reply[]> {
  try {
    // Fetch replies for the specified review
    const replies = await this.prisma.reply.findMany({
      where: { reviewId: reviewId },
      include: {
        Author: true,  // Include the author details for each reply
      },
    });

    if (!replies) {
      throw new NotFoundException(`Replies for Review ID ${reviewId} not found`);
    }

    return replies;
  } catch (error) {
    console.error('Error fetching replies for review:', error);
    throw new InternalServerErrorException('Failed to fetch replies');
  }
}

async acceptOrRejectManuscript(
  userId: string,
  dto: AcceptRejectManuscriptDto
) {
  const { manuscriptId, status } = dto;

  // Find the reviewer by userId
const reviewer = await this.prisma.reviewer.findUnique({
  where: { userId: userId },
});

if (!reviewer) {
  throw new ForbiddenException(`User with ID ${userId} is not a reviewer`);
}

  // Find the manuscript
  const manuscript = await this.prisma.manuscript.findUnique({
    where: { id: manuscriptId },
    include: { Reviewer: true },  // Include Reviewer to validate
  });

  if (!manuscript) {
    throw new NotFoundException(`Manuscript with ID ${manuscriptId} not found`);
  }

  // Check if the logged-in user is the reviewer assigned to the manuscript
  if (manuscript.reviewerId !== reviewer.id) {
    throw new ForbiddenException(`User with ID ${userId} is not the assigned reviewer for this manuscript`);
  }

  // Update the manuscript status
  const updatedManuscript = await this.prisma.manuscript.update({
    where: { id: manuscriptId },
    data: {
      status,
    },
  });

  return updatedManuscript;
}



getAllRecommendations(): Recommendation[] {
  return Object.values(Recommendation);
}

}

