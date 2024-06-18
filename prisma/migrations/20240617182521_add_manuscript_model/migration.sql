/*
  Warnings:

  - You are about to drop the column `submissionDate` on the `Manuscript` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Manuscript` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suggestedReviewer` to the `Manuscript` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Manuscript` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Manuscript` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Manuscript" DROP COLUMN "submissionDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "suggestedReviewer" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedBy" TEXT NOT NULL;
