/*
  Warnings:

  - Added the required column `postId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "postId" INTEGER NOT NULL;
