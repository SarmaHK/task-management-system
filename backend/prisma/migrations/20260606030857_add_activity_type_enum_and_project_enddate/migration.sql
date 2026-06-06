/*
  Warnings:

  - Changed the type of `action` on the `task_activities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATED', 'UPDATED', 'ASSIGNED', 'COMMENTED', 'COMPLETED', 'DELETED');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "endDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "task_activities" DROP COLUMN "action",
ADD COLUMN     "action" "ActivityType" NOT NULL;
