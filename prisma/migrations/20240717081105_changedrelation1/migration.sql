/*
  Warnings:

  - You are about to drop the column `editorId` on the `Publication` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Publication" DROP CONSTRAINT "Publication_editorId_fkey";

-- AlterTable
ALTER TABLE "Publication" DROP COLUMN "editorId",
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
