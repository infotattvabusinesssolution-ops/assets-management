import {
  getPolicyForCompany,
  savePolicyForCompany,
  getAllCompanyPolicies,
  buildPasswordRegex,
  validatePasswordAgainstPolicy,
  generateCompliantPassword
} from './passwordPolicy.service.js';
import { logger } from '../../config/logger.js';

export async function getPasswordPolicy(req, res) {
  try {
    const companyId = req.query.companyId || req.user?.companyId || null;
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
      message: 'Password Policy Configuration saved successfully.'
    });
  } catch (err) {
    logger.error('Error in savePasswordPolicy:', err);
    return res.status(500).json({ success: false, message: 'Failed to save password policy' });
  }
}

export async function getAllPasswordPolicies(req, res) {
  try {
    const policies = await getAllCompanyPolicies();
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
