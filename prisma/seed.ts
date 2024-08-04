const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const roles = [
  { roleName: "super-admin", description: "Has full access to all features and settings.", createdBy: "system", updatedBy: "system" },
  { roleName: "Editor-in-Chief", description: "Oversees the entire editorial process.", createdBy: "system", updatedBy: "system" },
  { roleName: "Managing-Editor", description: "Manages the editorial workflow.", createdBy: "system", updatedBy: "system" },
  { roleName: "Section-Editor", description: "Manages specific sections of the publication.", createdBy: "system", updatedBy: "system" },
  { roleName: "Associate-Editor", description: "Assists the section editors.", createdBy: "system", updatedBy: "system" },
  { roleName: "Production-Editor", description: "Oversees the production process.", createdBy: "system", updatedBy: "system" },
  { roleName: "Copy-Editor", description: "Edits content for grammar and style.", createdBy: "system", updatedBy: "system" },
  { roleName: "reviewer", description: "Reviews submissions for quality and accuracy.", createdBy: "system", updatedBy: "system" },
  { roleName: "author", description: "submits manuscript for review and publication", createdBy: "system", updatedBy: "system" }

];

async function main() {
  for (const role of roles) {
    await prisma.role.create({
      data: role
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
