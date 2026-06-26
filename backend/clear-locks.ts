import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database to check for advisory locks...');

  const locks = await prisma.$queryRawUnsafe<any[]>(`
    SELECT pid, objid 
    FROM pg_locks 
    WHERE locktype = 'advisory';
  `);

  console.log('Active advisory locks:', locks);

  for (const lock of locks) {
    console.log(`Terminating connection with pid: ${lock.pid} holding lock objid: ${lock.objid}...`);
    try {
      await prisma.$queryRawUnsafe(`
        SELECT pg_terminate_backend(${lock.pid});
      `);
      console.log(`Successfully terminated pid: ${lock.pid}`);
    } catch (e) {
      console.error(`Failed to terminate pid: ${lock.pid}`, e);
    }
  }

  // Also check for long-running idle transactions
  const idleConns = await prisma.$queryRawUnsafe<any[]>(`
    SELECT pid, state, state_change
    FROM pg_stat_activity
    WHERE state = 'idle in transaction' OR state = 'idle';
  `);
  
  console.log(`Found ${idleConns.length} idle connections. Not killing them unless they hold locks, but listing them:`);
  console.log(idleConns.slice(0, 5)); // Just show first 5

  console.log('Finished clearing locks. You can now try to run migrations again.');
}

main()
  .catch(e => {
    console.error('Error executing script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
