import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true, email: true }
  });
  console.log(users);
}

checkUsers()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
