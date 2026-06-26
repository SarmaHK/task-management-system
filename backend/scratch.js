const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.systemLog.findMany({orderBy: {createdAt: 'desc'}, take: 10})
  .then(logs => console.log(JSON.stringify(logs, null, 2)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
