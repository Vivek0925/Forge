/*
  Warnings:

  - Made the column `meetingCode` on table `meetings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "meetings" ALTER COLUMN "meetingCode" SET NOT NULL;
