/// <reference types="node" />
import { PrismaClient, Role, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding default users...')
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('@Admin1234', salt);
  const pmPassword = await bcrypt.hash('@Manager1234', salt);
  const collabPassword = await bcrypt.hash('@Collab1234', salt);

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      passwordHash: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: 'System Admin',
      email: 'admin@gmail.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      mustChangePassword: false,
    },
  });

  await prisma.user.upsert({
    where: { email: 'pm@gmail.com' },
    update: {
      passwordHash: pmPassword,
      role: Role.PROJECT_MANAGER,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: 'Project Manager',
      email: 'pm@gmail.com',
      passwordHash: pmPassword,
      role: Role.PROJECT_MANAGER,
      status: UserStatus.ACTIVE,
      mustChangePassword: false,
    },
  });

  await prisma.user.upsert({
    where: { email: 'collab@gmail.com' },
    update: {
      passwordHash: collabPassword,
      role: Role.COLLABORATOR,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: 'Collaborator',
      email: 'collab@gmail.com',
      passwordHash: collabPassword,
      role: Role.COLLABORATOR,
      status: UserStatus.ACTIVE,
      mustChangePassword: false,
    },
  });

  console.log('✅ Users seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })