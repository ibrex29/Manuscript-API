import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
// import { RolesPermissionsService } from 'src/modules/services/roles-permissions.service';
import { UserNotFoundException } from './exceptions/UserNotFound.exception';
import { UpdateUserParams } from './types';
//import { RoleNotFoundException } from '../exceptions/RoleNotFound.exception';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    // private readonly rolesPermissionsService: RolesPermissionsService,
  ) {}

  findUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        roles: true,
      },
    });
  }

 

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        roles: true,
        // isActive: true,
      },
    });
  }

  async findUserById(id: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        roles: true,
      },
    });
  }

//   async createUser(userDetails: CreateUserParams): Promise<User> {
//     const user = await this.prisma.user.findUnique({
//       where: {
//         email: userDetails.email,
//       },
//     });

//     if (user) {
//       throw new UserAlreadyExistsException();
//     }

    // const role = await this.prisma.role.findUnique({
    //   where: {
    //     roleName: userDetails.role,
    //   },
    // });

    // if (!role) {
    //   throw new RoleNotFoundException();
    // }

//     return this.prisma.user.create({
//       data: {
//         email: userDetails.email,
//         password: userDetails.password,
//         roles: {
//           connectOrCreate: {
//             where: {
//               roleName: userDetails.role,
//             },
//             create: {
//               roleName: userDetails.role,
//             },
//           },
//         },
//         // isActive: true,
//       },
//     });
//   }

  async updateUser(
    userId: string,
    updateUserDetails: UpdateUserParams,
  ): Promise<User> {
    await this.validateUserExists(userId);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: updateUserDetails,
    });
  }

  async deleteUser(userId: string): Promise<User> {
    await this.validateUserExists(userId);

    return this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }



  async validateUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UserNotFoundException();
    }
  }

  async validateUserEmailExists(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      throw new UserNotFoundException();
    }
  }

  async updateUserRoles(userId: string, roleNames: string[]): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingRoles = await this.prisma.role.findMany({
      where: { roleName: { in: roleNames } },
    });

    const existingRoleNames = existingRoles.map((role) => role.roleName);
    const nonExistingRoles = roleNames.filter(
      (roleName) => !existingRoleNames.includes(roleName),
    );

    if (nonExistingRoles.length !== 0) {
      throw new NotFoundException(
        'Roles not found ' + nonExistingRoles.join(','),
      );
    }

    // Experimental: Create non-existing roles
    /**const createdRoles = await this.rolesPermissionsService.createRoles(
        nonExistingRoles,
      );
      **/

    // Update user's roles
    const updatedRoles = [...existingRoles];
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: updatedRoles.map((role) => ({ id: role.id })),
        },
      },
    });
  }

  async deleteUserRoles(userId: string, roleNames: string[]): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find roles to disconnect
    const rolesToDisconnect = user.roles.filter((role) =>
      roleNames.includes(role.roleName),
    );

    if (rolesToDisconnect.length === 0) {
      throw new NotFoundException('No matching roles found for deletion');
    }

    // Disconnect roles
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: rolesToDisconnect.map((role) => ({ id: role.id })),
        },
      },
    });
  }

//   async activateUser(userId: string): Promise<void> {
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     await this.prisma.user.update({
//       where: { id: userId },
//       data: {
//         isActive: true,
//       },
//     });
//   }

//   async deactivateUser(userId: string): Promise<void> {
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//     });

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     await this.prisma.user.update({
//       where: { id: userId },
//       data: {
//         isActive: false,
//       },
//     });
//   }

 
}
