import {
  getPolicyForCompany,
  savePolicyForCompany,
  getAllCompanyPolicies,
  buildPasswordRegex,
  validatePasswordAgainstPolicy,
  generateCompliantPassword
} from './passwordPolicy.service.js';
import { logger } from '../../config/logger.js';

export function isUserSysAdmin(user) {
  if (!user) return false;
  const role = user.role || user.roleId;
  const roleCode = typeof role === 'string' ? role : (role?.code || role?.name);
  return roleCode === 'SYS_ADMIN' || roleCode === 'System Administrator' || role?.isSystem === true;
}

export async function getPasswordPolicy(req, res) {
  try {
    const user = req.user;
    let companyId = req.query.companyId || user?.companyId || null;

    // Multi-tenant check: Company Admins cannot peek at other companies' policies
    if (user && !isUserSysAdmin(user)) {
      if (req.query.companyId && user.companyId && req.query.companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not authorized to view another company password policy.'
        });
      }
      companyId = user.companyId;
    }

    const policy = await getPolicyForCompany(companyId);
    const regexPattern = buildPasswordRegex(policy);

    return res.json({
      success: true,
      policy,
      regexPattern,
      isDefault: !policy.companyId
    });
  } catch (err) {
    logger.error('Error in getPasswordPolicy:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve password policy' });
  }
}

export async function savePasswordPolicy(req, res) {
  try {
    const user = req.user;
    const {
      companyId,
      minLength,
      maxLength,
      requireUppercase,
      requireLowercase,
      requireNumber,
      requireSpecialChar,
      preventSpaces
    } = req.body;

    // Multi-tenant security check
    if (user && !isUserSysAdmin(user)) {
      if (!companyId || companyId === 'DEFAULT' || companyId === '__DEFAULT__') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Only System Administrators can configure the global default password policy.'
        });
      }
      if (user.companyId && companyId !== user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are only authorized to configure password policies for your own company.'
        });
      }
    }

    // Minimum sanity checks
    const min = Number(minLength) || 8;
    const max = maxLength ? Number(maxLength) : 32;

    if (min < 4) {
      return res.status(400).json({ success: false, message: 'Minimum password length cannot be less than 4.' });
    }
    if (max < min) {
      return res.status(400).json({ success: false, message: 'Maximum password length cannot be less than minimum length.' });
    }

    const saved = await savePolicyForCompany(companyId || null, {
      minLength: min,
      maxLength: max,
      requireUppercase: Boolean(requireUppercase !== false),
      requireLowercase: Boolean(requireLowercase !== false),
      requireNumber: Boolean(requireNumber !== false),
      requireSpecialChar: Boolean(requireSpecialChar !== false),
      preventSpaces: Boolean(preventSpaces !== false)
    });

    return res.json({
      success: true,
      policy: saved,
      regexPattern: saved.regexPattern,
      persistedToDatabase: saved.persistedToDatabase,
      message: saved.persistedToDatabase
        ? 'Password Policy Configuration saved successfully to database.'
        : 'Password Policy Configuration saved to session memory (Database offline).'
    });
  } catch (err) {
    logger.error('Error in savePasswordPolicy:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to save password policy' });
  }
}

export async function getAllPasswordPolicies(req, res) {
  try {
    const policies = await getAllCompanyPolicies();
    if (req.user && !isUserSysAdmin(req.user)) {
      const userCompId = req.user.companyId;
      const filtered = policies.filter(p => !p.companyId || p.companyId === userCompId);
      return res.json({ success: true, policies: filtered });
    }
    return res.json({ success: true, policies });
  } catch (err) {
    logger.error('Error in getAllPasswordPolicies:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve policies list' });
  }
}

export async function generateCompliantPasswordEndpoint(req, res) {
  try {
    const companyId = req.query.companyId || req.body?.companyId || req.user?.companyId || null;
    const policy = await getPolicyForCompany(companyId);
    const password = generateCompliantPassword(policy);

    return res.json({
      success: true,
      password,
      policy
    });
  } catch (err) {
    logger.error('Error in generateCompliantPasswordEndpoint:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate password' });
  }
}

export async function testPasswordSimulation(req, res) {
  try {
    const { password, policy: customPolicy, companyId } = req.body;
    let policy = customPolicy;
    if (!policy) {
      policy = await getPolicyForCompany(companyId || null);
    }

    const result = validatePasswordAgainstPolicy(password, policy);
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    logger.error('Error in testPasswordSimulation:', err);
    return res.status(500).json({ success: false, message: 'Failed to simulate password check' });
  }
}
