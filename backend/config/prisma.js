import prismaPkg from '../node_modules/.prisma/maintenance-client-v6/index.js';

const PrismaClient = prismaPkg?.PrismaClient || prismaPkg?.default?.PrismaClient;

let prismaInstance;
let isConnected = false;

export function setDbConnected(val) {
  isConnected = Boolean(val);
}

export function getDbConnected() {
  return isConnected;
}

const DROPPED_MODELS = new Set(['building', 'floor', 'room', 'zone', 'floorMap', 'floorMapZone', 'assetMapPosition']);
const DROPPED_RELATIONS = ['building', 'floor', 'room', 'zone', 'mapPosition', 'floorMap', 'buildings', 'floors', 'rooms', 'zones', 'mapZones', 'assetPositions'];

function sanitizeArgs(args) {
  if (!args || typeof args !== 'object') return args;
  if (args.include && typeof args.include === 'object') {
    for (const rel of DROPPED_RELATIONS) {
      if (rel in args.include) delete args.include[rel];
    }
    if (Object.keys(args.include).length === 0) delete args.include;
  }
  if (args.select && typeof args.select === 'object') {
    for (const rel of DROPPED_RELATIONS) {
      if (rel in args.select) delete args.select[rel];
    }
  }
  return args;
}

const dummyModelHandler = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  count: async () => 0,
  create: async ({ data } = {}) => ({ id: 'removed', ...(data || {}) }),
  update: async ({ data } = {}) => ({ id: 'removed', ...(data || {}) }),
  updateMany: async () => ({ count: 0 }),
  delete: async () => null,
  deleteMany: async () => ({ count: 0 }),
  upsert: async () => null,
};

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
    client: {
      async $queryRawUnsafe(...args) {
        if (!isConnected) {
          throw new Error('Database is offline (Resilient mode active). Skipping $queryRawUnsafe.');
        }
        return basePrisma.$queryRawUnsafe(...args);
      },
      async $executeRawUnsafe(...args) {
        if (!isConnected) {
          throw new Error('Database is offline (Resilient mode active). Skipping $executeRawUnsafe.');
        }
        return basePrisma.$executeRawUnsafe(...args);
      },
      async $queryRaw(...args) {
        if (!isConnected) {
          throw new Error('Database is offline (Resilient mode active). Skipping $queryRaw.');
        }
        return basePrisma.$queryRaw(...args);
      },
      async $executeRaw(...args) {
        if (!isConnected) {
          throw new Error('Database is offline (Resilient mode active). Skipping $executeRaw.');
        }
        return basePrisma.$executeRaw(...args);
      }
    },
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!isConnected) {
            throw new Error(`Database is offline (Resilient mode active). Skipping Prisma query on ${model}.${operation}`);
          }
          return query(sanitizeArgs(args));
        }
      }
    }
  });

  prismaInstance = new Proxy(prismaInstance, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && DROPPED_MODELS.has(prop)) {
        return dummyModelHandler;
      }
      return Reflect.get(target, prop, receiver);
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

