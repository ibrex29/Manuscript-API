/*
  Warnings:

  - You are about to drop the column `publicationId` on the `Manuscript` table. All the data in the column will be lost.
  - Added the required column `manuscriptid` to the `Publication` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Manuscript" DROP CONSTRAINT "Manuscript_publicationId_fkey";

-- AlterTable
ALTER TABLE "Manuscript" DROP COLUMN "publicationId";

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "manuscriptid" TEXT NOT NULL;
