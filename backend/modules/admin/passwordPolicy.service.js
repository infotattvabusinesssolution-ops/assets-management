import crypto from 'crypto';
import { prisma } from '../../config/prisma.js';
import { isDbConnected } from '../../config/db.js';
import { logger } from '../../config/logger.js';

// Default Global System Password Policy
export const DEFAULT_PASSWORD_POLICY = {
  id: 'DEFAULT',
  companyId: null,
  minLength: 8,
  maxLength: 32,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  preventSpaces: true
};

// Resilient in-memory store for company policies
export const memoryPasswordPolicies = new Map();
memoryPasswordPolicies.set('__DEFAULT__', { ...DEFAULT_PASSWORD_POLICY });

let tableEnsured = false;

/**
 * Ensures the company_password_policies table exists in the database
 */
export async function ensurePasswordPoliciesTable() {
  if (tableEnsured || !isDbConnected()) return;
  try {
    await prisma.$executeRawUnsafe(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='company_password_policies' and xtype='U')
      BEGIN
        CREATE TABLE company_password_policies (
          id NVARCHAR(100) PRIMARY KEY,
          company_id NVARCHAR(100) NULL,
          min_length INT DEFAULT 8,
          max_length INT DEFAULT 32,
          require_uppercase BIT DEFAULT 1,
          require_lowercase BIT DEFAULT 1,
          require_number BIT DEFAULT 1,
          require_special_char BIT DEFAULT 1,
          prevent_spaces BIT DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      END
    `);
    tableEnsured = true;
    logger.info('Company password policies table ensured in database.');
  } catch (err) {
    logger.warn('Could not ensure company_password_policies table (using resilient memory fallback): ' + err.message);
  }
}

/**
 * Dynamically builds a Regular Expression pattern string from policy configuration
 * Example: ^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])(?!.*\s).{8,32}$
 */
export function buildPasswordRegex(policy = DEFAULT_PASSWORD_POLICY) {
  const min = Math.max(Number(policy.minLength) || 8, 4);
  const max = policy.maxLength ? Number(policy.maxLength) : '';
  
  let lookaheads = '';
  if (policy.requireUppercase) {
    lookaheads += '(?=.*[A-Z])';
  }
  if (policy.requireLowercase) {
    lookaheads += '(?=.*[a-z])';
  }
  if (policy.requireNumber) {
    lookaheads += '(?=.*\\d)';
  }
  if (policy.requireSpecialChar) {
    lookaheads += '(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?])';
  }
  if (policy.preventSpaces) {
    lookaheads += '(?!.*\\s)';
  }

  const lengthRange = max ? `{${min},${max}}` : `{${min},}`;
  return `^${lookaheads}.${lengthRange}$`;
}

/**
 * Validates a password against a given policy, returning both a boolean
 * and a list of individual rule results and error messages.
 */
export function validatePasswordAgainstPolicy(password, policy = DEFAULT_PASSWORD_POLICY) {
  const pass = String(password || '');
  const min = Math.max(Number(policy.minLength) || 8, 4);
  const max = policy.maxLength ? Number(policy.maxLength) : 128;

  const ruleResults = [
    {
      id: 'min_length',
      label: `Minimum ${min} characters`,
      met: pass.length >= min,
      required: true
    },
    {
      id: 'max_length',
      label: `Maximum ${max} characters`,
      met: pass.length <= max,
      required: Boolean(policy.maxLength)
    },
    {
      id: 'require_uppercase',
      label: 'At least one uppercase letter (A–Z)',
      met: /[A-Z]/.test(pass),
      required: Boolean(policy.requireUppercase)
    },
    {
      id: 'require_lowercase',
      label: 'At least one lowercase letter (a–z)',
      met: /[a-z]/.test(pass),
      required: Boolean(policy.requireLowercase)
    },
    {
      id: 'require_number',
      label: 'At least one number (0–9)',
      met: /\d/.test(pass),
      required: Boolean(policy.requireNumber)
    },
    {
      id: 'require_special_char',
      label: 'At least one special character (!@#$%)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass),
      required: Boolean(policy.requireSpecialChar)
    },
    {
      id: 'prevent_spaces',
      label: 'Prevent spaces',
      met: !/\s/.test(pass),
      required: Boolean(policy.preventSpaces)
    }
  ];

  const failedRules = ruleResults.filter(r => r.required && !r.met);
  const regexPattern = buildPasswordRegex(policy);

  return {
    isValid: failedRules.length === 0,
    regexPattern,
    ruleResults,
    errors: failedRules.map(r => r.label)
  };
}

/**
 * Generates a random password using cryptographically secure random generation (CSPRNG)
 * that strictly complies with every active policy requirement.
 */
export function generateCompliantPassword(policy = DEFAULT_PASSWORD_POLICY) {
  const min = Math.max(Number(policy.minLength) || 8, 8);
  const max = policy.maxLength ? Math.max(Number(policy.maxLength), min) : 32;
  const targetLength = Math.min(Math.max(min, 10), max);

  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const specials = '!@#$%&*';

  const getSecureRandomInt = (maxVal) => {
    return crypto.randomInt(0, maxVal);
  };

  let chars = '';
  const requiredChars = [];

  if (policy.requireUppercase) {
    chars += uppers;
    requiredChars.push(uppers[getSecureRandomInt(uppers.length)]);
  }
  if (policy.requireLowercase) {
    chars += lowers;
    requiredChars.push(lowers[getSecureRandomInt(lowers.length)]);
  }
  if (policy.requireNumber) {
    chars += numbers;
    requiredChars.push(numbers[getSecureRandomInt(numbers.length)]);
  }
  if (policy.requireSpecialChar) {
    chars += specials;
    requiredChars.push(specials[getSecureRandomInt(specials.length)]);
  }

  if (chars.length === 0) {
    chars = uppers + lowers + numbers;
  }

  const remaining = targetLength - requiredChars.length;
  for (let i = 0; i < remaining; i++) {
    requiredChars.push(chars[getSecureRandomInt(chars.length)]);
  }

  // Fisher-Yates CSPRNG shuffle
  for (let i = requiredChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
  }

  const generated = requiredChars.join('');
  // Self-verification safety check
  const check = validatePasswordAgainstPolicy(generated, policy);
  if (!check.isValid) {
    return generateCompliantPassword(policy);
  }

  return generated;
}

/**
 * Retrieves the effective policy for a company (or fallback to global default)
 */
export async function getPolicyForCompany(companyId = null) {
  await ensurePasswordPoliciesTable();

  // Try DB first if connected
  if (isDbConnected()) {
    try {
      if (companyId) {
        const rows = await prisma.$queryRawUnsafe(`
          SELECT TOP 1 * FROM company_password_policies 
          WHERE company_id = '${companyId.replace(/'/g, "''")}'
        `);
        if (rows && rows.length > 0) {
          const mapped = mapDbRowToPolicy(rows[0]);
          mapped.isDefault = false;
          memoryPasswordPolicies.set(companyId, mapped);
          return mapped;
        }
      }

      // Check for global default in DB
      const defaultRows = await prisma.$queryRawUnsafe(`
        SELECT TOP 1 * FROM company_password_policies 
        WHERE company_id IS NULL OR company_id = 'DEFAULT' OR company_id = '__DEFAULT__'
      `);
      if (defaultRows && defaultRows.length > 0) {
        const mapped = mapDbRowToPolicy(defaultRows[0]);
        mapped.isDefault = !companyId;
        memoryPasswordPolicies.set('__DEFAULT__', mapped);
        return mapped;
      }
    } catch (err) {
      logger.warn('Failed querying DB for password policy, using memory store: ' + err.message);
    }
  }

  // Fallback to memory store
  if (companyId && memoryPasswordPolicies.has(companyId)) {
    const p = memoryPasswordPolicies.get(companyId);
    return { ...p, isDefault: false };
  }
  if (memoryPasswordPolicies.has('__DEFAULT__')) {
    const p = memoryPasswordPolicies.get('__DEFAULT__');
    return { ...p, isDefault: true };
  }

  return { ...DEFAULT_PASSWORD_POLICY, isDefault: true };
}

/**
 * Saves/updates policy for a specific company or the global default
 */
export async function savePolicyForCompany(companyId, data) {
  await ensurePasswordPoliciesTable();

  const minLength = Math.max(Number(data.minLength) || 8, 4);
  const maxLength = data.maxLength ? Math.max(Number(data.maxLength), minLength) : 32;
  const requireUppercase = Boolean(data.requireUppercase !== false);
  const requireLowercase = Boolean(data.requireLowercase !== false);
  const requireNumber = Boolean(data.requireNumber !== false);
  const requireSpecialChar = Boolean(data.requireSpecialChar !== false);
  const preventSpaces = Boolean(data.preventSpaces !== false);

  const key = companyId && companyId !== 'DEFAULT' && companyId !== '__DEFAULT__' ? companyId : null;
  const policyId = `POL-${key ? key.substring(0, 8) : 'DEFAULT'}-${Date.now()}`;

  const policyObject = {
    id: policyId,
    companyId: key,
    minLength,
    maxLength,
    requireUppercase,
    requireLowercase,
    requireNumber,
    requireSpecialChar,
    preventSpaces,
    updatedAt: new Date().toISOString()
  };

  // Update memory store
  memoryPasswordPolicies.set(key || '__DEFAULT__', policyObject);

  // Update DB if connected
  if (isDbConnected()) {
    try {
      const companyVal = key ? `'${key.replace(/'/g, "''")}'` : 'NULL';
      const whereClause = key ? `company_id = '${key.replace(/'/g, "''")}'` : `company_id IS NULL OR company_id = 'DEFAULT'`;

      const existing = await prisma.$queryRawUnsafe(`
        SELECT TOP 1 id FROM company_password_policies WHERE ${whereClause}
      `);

      if (existing && existing.length > 0) {
        await prisma.$executeRawUnsafe(`
          UPDATE company_password_policies
          SET min_length = ${minLength},
              max_length = ${maxLength},
              require_uppercase = ${requireUppercase ? 1 : 0},
              require_lowercase = ${requireLowercase ? 1 : 0},
              require_number = ${requireNumber ? 1 : 0},
              require_special_char = ${requireSpecialChar ? 1 : 0},
              prevent_spaces = ${preventSpaces ? 1 : 0},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = '${existing[0].id}'
        `);
      } else {
        await prisma.$executeRawUnsafe(`
          INSERT INTO company_password_policies (
            id, company_id, min_length, max_length,
            require_uppercase, require_lowercase, require_number,
            require_special_char, prevent_spaces, created_at, updated_at
          ) VALUES (
            '${policyId}', ${companyVal}, ${minLength}, ${maxLength},
            ${requireUppercase ? 1 : 0}, ${requireLowercase ? 1 : 0}, ${requireNumber ? 1 : 0},
            ${requireSpecialChar ? 1 : 0}, ${preventSpaces ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `);
      }
    } catch (err) {
      logger.error('Failed to persist password policy to SQL Server: ' + err.message);
      throw new Error('Database persistence failed: ' + err.message);
    }
  }

  return {
    ...policyObject,
    isDefault: !key,
    persistedToDatabase: isDbConnected(),
    regexPattern: buildPasswordRegex(policyObject)
  };
}

/**
 * Retrieves all company password policies
 */
export async function getAllCompanyPolicies() {
  await ensurePasswordPoliciesTable();
  const result = [];

  if (isDbConnected()) {
    try {
      const rows = await prisma.$queryRawUnsafe(`
        SELECT p.*, c.name as company_name, c.code as company_code
        FROM company_password_policies p
        LEFT JOIN companies c ON p.company_id = c.id
        ORDER BY p.updated_at DESC
      `);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          ...mapDbRowToPolicy(r),
          companyName: r.company_name || 'System Default',
          companyCode: r.company_code || 'ALL',
          regexPattern: buildPasswordRegex(mapDbRowToPolicy(r))
        }));
      }
    } catch (err) {
      logger.warn('Failed querying all policies from DB: ' + err.message);
    }
  }

  // Memory fallback
  for (const [k, p] of memoryPasswordPolicies.entries()) {
    result.push({
      ...p,
      companyName: k === '__DEFAULT__' ? 'System Default' : `Company (${k})`,
      regexPattern: buildPasswordRegex(p)
    });
  }

  return result;
}

function mapDbRowToPolicy(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    minLength: Number(row.min_length || row.minLength || 8),
    maxLength: row.max_length || row.maxLength ? Number(row.max_length || row.maxLength) : 32,
    requireUppercase: Boolean(row.require_uppercase ?? row.requireUppercase),
    requireLowercase: Boolean(row.require_lowercase ?? row.requireLowercase),
    requireNumber: Boolean(row.require_number ?? row.requireNumber),
    requireSpecialChar: Boolean(row.require_special_char ?? row.requireSpecialChar),
    preventSpaces: Boolean(row.prevent_spaces ?? row.preventSpaces),
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  };
}
