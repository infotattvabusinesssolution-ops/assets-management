import prismaPkg from '@prisma/client';

const PrismaClient = prismaPkg?.PrismaClient || prismaPkg?.default?.PrismaClient;

let prismaInstance;

if (PrismaClient) {
  const globalForPrisma = globalThis;
  prismaInstance = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
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
