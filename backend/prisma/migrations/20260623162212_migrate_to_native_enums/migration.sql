-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'COLLABORATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable (Add temporary nullable columns)
ALTER TABLE "users" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "role" "Role" DEFAULT 'COLLABORATOR',
ADD COLUMN     "status" "UserStatus" DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Copy Data: password -> passwordHash
UPDATE "users" SET "passwordHash" = "password";

-- Copy Data: isActive -> status
UPDATE "users" SET "status" = 'ACTIVE' WHERE "isActive" = true;
UPDATE "users" SET "status" = 'INACTIVE' WHERE "isActive" = false;

-- Copy Data: roleId -> role (matching by roles.name from roles table)
UPDATE "users" 
SET "role" = 'ADMIN' 
WHERE "roleId" IN (SELECT "id" FROM "roles" WHERE "name" = 'Administrator');

UPDATE "users" 
SET "role" = 'PROJECT_MANAGER' 
WHERE "roleId" IN (SELECT "id" FROM "roles" WHERE "name" = 'Project Manager');

UPDATE "users" 
SET "role" = 'COLLABORATOR' 
WHERE "roleId" IN (SELECT "id" FROM "roles" WHERE "name" = 'Collaborator');

-- Enforce NOT NULL constraints on newly populated fields
ALTER TABLE "users" ALTER COLUMN "passwordHash" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "status" SET NOT NULL;

-- Drop relation constraint and old columns/tables
ALTER TABLE "users" DROP CONSTRAINT "users_roleId_fkey";
ALTER TABLE "users" DROP COLUMN "password";
ALTER TABLE "users" DROP COLUMN "roleId";
ALTER TABLE "users" DROP COLUMN "isActive";

DROP TABLE "roles";
