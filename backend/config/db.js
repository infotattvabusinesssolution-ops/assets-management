import prisma, { setDbConnected } from './prisma.js';

export let isSqlServerConnected = false;

export function isDbConnected() {
  return isSqlServerConnected;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Microsoft SQL Server 2025 Database via Prisma ORM');
    isSqlServerConnected = true;
    setDbConnected(true);
  } catch (sqlErr) {
    console.warn('⚠️ Microsoft SQL Server connection warning:', sqlErr.message);
    console.log('ℹ️ Running in resilient mode with in-memory persistence and ERP integration service.');
    isSqlServerConnected = false;
    setDbConnected(false);
  }
}

/**
 * Execute Transaction via Prisma
 */
export async function withTransaction(fn) {
  if (!isSqlServerConnected) {
    throw new Error('Database is offline (Resilient mode active)');
  }
  return await prisma.$transaction(async (tx) => {
    return await fn(tx);
  });
}


