import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding roles...')

  await prisma.role.upsert({
    where: { name: 'Administrator' },
    update: {},
    create: {
      name: 'Administrator',
      description: 'Full access to user management and system configuration',
    },
  })

  await prisma.role.upsert({
    where: { name: 'Project Manager' },
    update: {},
    create: {
      name: 'Project Manager',
      description: 'Can create and manage projects, tasks, assign users',
    },
  })

  await prisma.role.upsert({
    where: { name: 'Collaborator' },
    update: {},
    create: {
      name: 'Collaborator',
      description: 'Can view tasks, update status, add comments',
    },
  })

  console.log('✅ Roles seeded successfully!')

  console.log('Seeding default users...')
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('@Admin1234', salt);
  const pmPassword = await bcrypt.hash('@Manager1234', salt);
  const collabPassword = await bcrypt.hash('@Collab1234', salt);

  const adminRole = await prisma.role.findUnique({ where: { name: 'Administrator' } });
  const pmRole = await prisma.role.findUnique({ where: { name: 'Project Manager' } });
  const collabRole = await prisma.role.findUnique({ where: { name: 'Collaborator' } });

  if (adminRole) {
    await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: {
        password: adminPassword,
      },
      create: {
        name: 'System Admin',
        email: 'admin@gmail.com',
        password: adminPassword,
        roleId: adminRole.id,
        firstLogin: false,
      },
    });
  }

  if (pmRole) {
    await prisma.user.upsert({
      where: { email: 'pm@gmail.com' },
      update: {
        password: pmPassword,
      },
      create: {
        name: 'Project Manager',
        email: 'pm@gmail.com',
        password: pmPassword,
        roleId: pmRole.id,
        firstLogin: false,
      },
    });
  }

  if (collabRole) {
    await prisma.user.upsert({
      where: { email: 'collab@gmail.com' },
      update: {
        password: collabPassword,
      },
      create: {
        name: 'Collaborator',
        email: 'collab@gmail.com',
        password: collabPassword,
        roleId: collabRole.id,
        firstLogin: false,
      },
    });
  }

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