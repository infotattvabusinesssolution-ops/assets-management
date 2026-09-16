import prismaPkg from '@prisma/client';

const PrismaClient = prismaPkg?.PrismaClient || prismaPkg?.default?.PrismaClient;

let prismaInstance;
let isConnected = false;

export function setDbConnected(val) {
  isConnected = Boolean(val);
}

export function getDbConnected() {
  return isConnected;
}

if (PrismaClient) {
  const globalForPrisma = globalThis;
  const basePrisma = globalForPrisma.basePrisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  });
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.basePrisma = basePrisma;
  }

  // Extend PrismaClient to fast-fail operations when database is offline in resilient mode,
  // preventing 10-second pool timeout hangs and unhandled connection errors
  prismaInstance = basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!isConnected) {
            throw new Error(`Database is offline (Resilient mode active). Skipping Prisma query on ${model}.${operation}`);
          }
          return query(args);
        }
      }
    }
  });
} else {
  console.warn('⚠️ Prisma Client is not generated yet. Please run `npx prisma generate` in the backend directory.');
  prismaInstance = new Proxy({}, {
    get(target, prop) {
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => {
          console.warn('⚠️ Database connection skipped: Prisma Client not generated yet. Run `npx prisma generate`.');
        };
      }
      return new Proxy({}, {
        get() {
          return async () => [];
        }
      });
    }
  });
}

export const prisma = prismaInstance;
export default prismaInstance;

