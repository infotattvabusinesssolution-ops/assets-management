import prisma, { setDbConnected } from './prisma.js';

export let isSqlServerConnected = false;
let reconnectTimer = null;

export function isDbConnected() {
  return isSqlServerConnected;
}

/**
 * Attempt to connect to Microsoft SQL Server with retries and auto-reconnect
 */
export async function connectDB(maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      await Promise.race([
        prisma.$connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SQL Server connection timeout after 15000ms')), 15000))
      ]);
      isSqlServerConnected = true;
      setDbConnected(true);
      console.log('✅ Connected to Microsoft SQL Server 2025 Database via Prisma ORM');
      if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      }
      return true;
    } catch (sqlErr) {
      await prisma.().catch(() => {});
      if (attempt < maxRetries) {
        const waitMs = attempt * 1000;
        console.warn(`⚠️ SQL Server connection attempt ${attempt}/${maxRetries} failed (${sqlErr.message}). Retrying in ${waitMs}ms...`);
        await new Promise((res) => setTimeout(res, waitMs));
      } else {
        console.warn('⚠️ Microsoft SQL Server connection warning:', sqlErr.message);
        console.log('ℹ️ Running in resilient mode with in-memory persistence and ERP integration service.');
        isSqlServerConnected = false;
        setDbConnected(false);

        // Start background auto-reconnect loop so DB recovers automatically when connection returns
        if (!reconnectTimer) {
          reconnectTimer = setInterval(async () => {
            try {
              await prisma.$connect();
              isSqlServerConnected = true;
              setDbConnected(true);
              console.log('✅ Auto-reconnected to Microsoft SQL Server 2025 Database via Prisma ORM');
              clearInterval(reconnectTimer);
              reconnectTimer = null;
              
              // Run ensureDefaultSeed once reconnected
              import('./seedHelper.js')
                .then(m => m.ensureDefaultSeed?.())
                .catch(() => {});
            } catch {
              // still offline, retry in next interval
            }
          }, 10000);
          reconnectTimer.unref?.();
        }
        return false;
      }
    }
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


