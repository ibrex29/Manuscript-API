/*
  Warnings:

  - You are about to drop the column `manuscriptid` on the `Publication` table. All the data in the column will be lost.
  - Added the required column `manuscriptId` to the `Publication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Publication" DROP COLUMN "manuscriptid",
ADD COLUMN     "manuscriptId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
