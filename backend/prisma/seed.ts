import { PrismaClient } from '@prisma/client'

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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })