/*
  Warnings:

  - A unique constraint covering the columns `[meetingCode]` on the table `meetings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "meetingCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "meetings_meetingCode_key" ON "meetings"("meetingCode");
