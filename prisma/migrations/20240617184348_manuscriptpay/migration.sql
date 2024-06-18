/*
  Warnings:

  - Added the required column `manuscriptLink` to the `Manuscript` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proofofPayment` to the `Manuscript` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Manuscript" ADD COLUMN     "manuscriptLink" TEXT NOT NULL,
ADD COLUMN     "proofofPayment" TEXT NOT NULL;
