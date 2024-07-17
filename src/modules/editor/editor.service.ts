import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEditorDto } from './dtos/create-editor.dto';
import * as bcrypt from 'bcrypt';
import { AssignReviewerDto } from './dtos/assign-reviewer.dto';
import { Manuscript, Status } from '@prisma/client';
import { UserType } from '../user/types/user.type';
import { AssignRoleByNameDto } from './dtos/assign-role-by-name.dto';
import { PublishManuscriptDto } from './dtos/publish-manuscript.dto';
import { CreateReviewerDto } from '../reviewer/dto/create-reviewer.dto';



@Injectable()
export class EditorService {
    constructor(private prisma: PrismaService) {}
 
    async createEditor(createAuthorDto: CreateEditorDto) {
      const { email, firstName, lastName, password, affiliation, expertiseArea } = createAuthorDto;
  
      // Find the author role
      const editorRole = await this.prisma.role.findUnique({
        where: { roleName: 'editor' }, // Adjust roleName as per your Role enum or database value
      });
  
      if (!editorRole) {
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
            connect: { id: editorRole.id }, // Connect user to the author role
          },
        },
      });
  
      // Create the author profile
      const creatededitor = await this.prisma.author.create({
        data: {
          userId: createdUser.id,
          affiliation,
          expertiseArea,
        },
      });
  
      return creatededitor;
    }

  //   async createReviewer(createReviewerDto: CreateReviewerDto) {
  //     const { email, password } = createReviewerDto;
  
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
  
  
  //     // Create the user 
  //     const createdUser = await this.prisma.user.create({
  //       data: {
  //         email,
  //         firstName : "",
  //         lastName: "",
  //         createdBy : "",
  //         createdAt: new Date().toISOString(),
  //         updatedBy: " ",
  //         password:hashedPassword,
  //         roles: {
  //           connect: { id: reviewerRole.id }, 
  //         },
  //       },
  //     });

  //     return createdUser
  
  // }

    async getAllAuthors() {
      return this.prisma.author.findMany({
        where: {
          User: {
            roles: {
              some: {
                roleName: UserType.AUTHOR,
              },
            },
          },
        },
        include: {
          User: {
            include: {
              roles: {
                select: {
                  roleName: true,
                },
              },
            },
          },
        },
      });
    }
    

    async assignManuscriptToReviewer(dto: AssignReviewerDto) {
      const { manuscriptId, reviewerId, reviewDueDate } = dto;
    
      // Find the manuscript
      const manuscript = await this.prisma.manuscript.findUnique({
        where: { id: manuscriptId },
      });
    
      if (!manuscript) {
        throw new NotFoundException(`Manuscript with ID ${manuscriptId} not found`);
      }
    
      // Check if the manuscript is already assigned to a reviewer
      if (manuscript.reviewerId) {
        throw new ConflictException('Manuscript is already assigned to a reviewer');
      }
    
       // Ensure the manuscript status is not "PUBLISHED"
    if (manuscript.status === Status.PUBLISHED) {
      throw new ConflictException('Cannot assign a reviewer to a published manuscript');
    }

      // Find the reviewer
      const reviewer = await this.prisma.reviewer.findUnique({
        where: { id: reviewerId },
      });
    
      if (!reviewer) {
        throw new NotFoundException(`Reviewer with ID ${reviewerId} not found`);
      }
    
      // Assign the manuscript to the reviewer and update the status to UNDER_REVIEW
      const updatedManuscript = await this.prisma.manuscript.update({
        where: { id: manuscriptId },
        data: {
          reviewerId: reviewerId,
          status: 'UNDER_REVIEW',  
          assigmentDate:new Date().toISOString(),
          reviewDueDate : reviewDueDate,
        },
      });
    
      return updatedManuscript;
    }
    
      async listSubmittedManuscripts(): Promise<Manuscript[]> {
        try {
          return await this.prisma.manuscript.findMany({
            where: { status: 'SUBMITTED' },
          });
        } catch (error) {
          console.error('Error listing submitted manuscripts:', error);
          throw new InternalServerErrorException('Failed to list submitted manuscripts');
        }
      }

      // New method to get all assigned manuscripts
  async getAllAssignedManuscripts() {
    const manuscripts = await this.prisma.manuscript.findMany({
      where: { reviewerId: { not: null } },
      include: { Reviewer: true },  // Include reviewer information
    });

    return manuscripts;
  }

  // New method to get all unassigned manuscripts
  async getAllUnassignedManuscripts() {
    const manuscripts = await this.prisma.manuscript.findMany({
      where: { reviewerId: null },
    });

    return manuscripts;
  }
  
  async getManuscriptDetails(manuscriptId: string) {
    // Find the manuscript with its author, reviewer, and reviews
    const manuscript = await this.prisma.manuscript.findUnique({
      where: { id: manuscriptId },
      include: {
        Author: true,  // Include the author who submitted the manuscript
        Reviewer: {    // Include the reviewer assigned to the manuscript
          include: {
            User: true  // Include the user details of the reviewer
          }
        },
        Review: {      // Include the reviews made on the manuscript
          include: {
            Reviewer: {
              include: {
                User: true  // Include the user details of the reviewer who made the comments
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

  async getAllReviewers() {
    return this.prisma.reviewer.findMany({
      include: {
        User: {
          include: {
            roles: {
              select: {
                roleName: true,  
              },
            },
          },
        },
      },
    });

  }
  

  async getManuscriptsByStatus(status: Status): Promise<{ count: number; manuscripts: Manuscript[] }> {
    const manuscripts = await this.prisma.manuscript.findMany({
      where: { status: status },
    });
    const count = manuscripts.length;
    return { count, manuscripts };
  }

  async countReviewers() {
    return this.prisma.reviewer.count();
  }

  async countAuthors() {
    return this.prisma.author.count();
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

  async getStatistics() {
    const [reviewerCount, authorCount, assignedManuscriptCount, unassignedManuscriptCount, publishedManuscriptCount] = await Promise.all([
      this.countReviewers(),
      this.countAuthors(),
      this.countAssignedManuscripts(),
      this.countUnassignedManuscripts(),
      this.countPublishedManuscripts()
    ]);

    return {
      reviewers: reviewerCount,
      authors: authorCount,
      assignedManuscripts: assignedManuscriptCount,
      unassignedManuscripts: unassignedManuscriptCount,
      publishedManuscripts: publishedManuscriptCount,
    };
  }


  // async publishsManuscript(manuscriptId: string,) {
  //   try {
  //     // Update the manuscript to be published and associate it with a publication
  //     const updatedManuscript = await this.prisma.manuscript.update({
  //       where: { id: manuscriptId },
  //       data: {
  //         isPublished: true,
  //         status:"PUBLISHED",
  //       },
  //     });
  //     return updatedManuscript;
  //   } catch (error) {
  //     console.error('Error publishing manuscript:', error);
  //     throw new Error('Could not publish manuscript.');
  //   }
  // }

  async getRoleIdByName(roleName: string): Promise<string> {
    const role = await this.prisma.role.findUnique({
      where: { roleName },
    });

    if (!role) {
      throw new Error(`Role with name ${roleName} not found`);
    }

    return role.id;
  }

  // Method to assign role by name
  async assignRoleByName(assignRoleByNameDto: AssignRoleByNameDto) {
    const { userId, roleName } = assignRoleByNameDto;
    const roleId = await this.getRoleIdByName(roleName);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId }
        }
      },
    });
  }


//   async publishManuscript(publishManuscriptDto: PublishManuscriptDto, userId: string) {
//     const { manuscriptId, title, abstract, keywords, formattedManuscript } = publishManuscriptDto;
    
//     // Fetch the manuscript to check its status
//     const manuscript = await this.prisma.manuscript.findUnique({
//       where: { id: manuscriptId }
//     });

//     if (!manuscript) {
//       throw new BadRequestException('Manuscript not found');
//     }

//     if (manuscript.status !== 'ACCEPTED') {
//       throw new BadRequestException('Manuscript status must be ACCEPTED By reviewer to be published');
//     }

//     // Update manuscript status to published
//     const updatedManuscript = await this.prisma.manuscript.update({
//       where: { id: manuscriptId },
//       data: {
//         status: 'PUBLISHED',
//         isPublished: true,
//         updatedAt: new Date(),
//         updatedBy: userId
//       }
//     });

//     // Create a Publication record
//     await this.prisma.publication.create({
//       data: {
//         title: title,
//         abstract: abstract,
//         keywords: keywords,
//         userId: userId,
//         formartedManuscript: formattedManuscript ,
//         manuscriptid: manuscriptId
//       }
//     });

//     return updatedManuscript;
//   }


}