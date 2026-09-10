import prisma from './prisma.js';

export let isPostgresConnected = false;

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL Database via Prisma ORM');
    isPostgresConnected = true;
  } catch (pgErr) {
    console.error('❌ PostgreSQL connection failed:', pgErr.message);
    throw pgErr;
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

