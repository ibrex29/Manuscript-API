// src/module/author/author.service.ts

import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Author } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthorDto } from './dtos/create-author.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

 
  async createAgent(createAuthorDto: CreateAuthorDto) {
    const { email, firstName, lastName, password, affiliation } = createAuthorDto;

    // Find the author role
    const authorRole = await this.prisma.role.findUnique({
      where: { roleName: 'author' }, // Adjust roleName as per your Role enum or database value
    });

    if (!authorRole) {
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
        createdBy : "",
        createdAt: new Date().toISOString(),
        updatedBy: " ",
        password:hashedPassword,
        roles: {
          connect: { id: authorRole.id }, // Connect user to the author role
        },
      },
    });

    // Create the author profile
    const createdAuthor = await this.prisma.author.create({
      data: {
        userId: createdUser.id,
        affiliation,
      },
    });

    return createdAuthor;
}

async getAllAuthors() {
    return this.prisma.author.findMany({
      include: {
        user: {
          include: {
            roles: {
              select: {
                roleName: true,  // Include only the roleName field
              },
            },
          },
        },
      },
    });

}

  async getAuthorById(id: string): Promise<Author | null> {
    return this.prisma.author.findUnique({ where: { id } });
  }

  async updateAuthor(id: string, data: Prisma.AuthorUpdateInput): Promise<Author> {
    return this.prisma.author.update({ where: { id }, data });
  }

  async deleteAuthor(id: string): Promise<Author> {
    return this.prisma.author.delete({ where: { id } });
  }
}
