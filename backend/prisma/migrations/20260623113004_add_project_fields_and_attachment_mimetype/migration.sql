-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "mimeType" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3);
