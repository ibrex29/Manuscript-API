import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      roleName: 'author',
      description: 'Author role',
      isActive: true,
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      roleName: 'editor',
      description: 'Editor role',
      isActive: true,
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      roleName: 'reviewer',
      description: 'Reviewer role',
      isActive: true,
      createdBy: 'system',
      updatedBy: 'system',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { roleName: role.roleName },
      update: {},
      create: role,
    });
  }

  console.log('Roles have been seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
