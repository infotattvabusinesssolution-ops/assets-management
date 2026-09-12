import prisma from './prisma.js';

export let isSqlServerConnected = false;

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Microsoft SQL Server 2025 Database via Prisma ORM');
    isSqlServerConnected = true;
  } catch (sqlErr) {
    console.error('❌ Microsoft SQL Server connection failed:', sqlErr.message);
    throw sqlErr;
  }
}

/**
 * Execute Transaction via Prisma
 */
export async function withTransaction(fn) {
  return await prisma.$transaction(async (tx) => {
    return await fn(tx);
  });
}

