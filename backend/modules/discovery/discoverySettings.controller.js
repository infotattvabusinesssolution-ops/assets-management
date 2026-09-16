import { DiscoverySettingsService } from './discoverySettings.service.js';

export async function getSettingsOverview(req, res, next) {
  try {
    const data = await DiscoverySettingsService.getOverview();
    res.json({ success: true, ...data });
  } catch (err) { next(err); }
}

// 1. Profiles
export async function getDiscoveryProfiles(req, res, next) {
  try {
    const profiles = await DiscoverySettingsService.getProfiles();
    res.json({ success: true, profiles });
  } catch (err) { next(err); }
}

export async function getDiscoveryProfileById(req, res, next) {
  try {
    const profile = await DiscoverySettingsService.getProfileById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (err) { next(err); }
}

export async function saveDiscoveryProfile(req, res, next) {
  try {
    const profile = await DiscoverySettingsService.saveProfile(req.body, req.user);
    res.status(200).json({ success: true, profile, message: 'Discovery profile saved successfully.' });
  } catch (err) { next(err); }
}

export async function cloneDiscoveryProfile(req, res, next) {
  try {
    const cloned = await DiscoverySettingsService.cloneProfile(req.params.id, req.user);
    res.status(201).json({ success: true, profile: cloned, message: 'Profile cloned successfully.' });
  } catch (err) { next(err); }
}

export async function deleteDiscoveryProfile(req, res, next) {
  try {
    const deleted = await DiscoverySettingsService.deleteProfile(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, message: 'Profile deleted successfully.' });
  } catch (err) { next(err); }
}

// 2. Credential Vault
export async function getCredentials(req, res, next) {
  try {
    const credentials = await DiscoverySettingsService.getCredentials();
    res.json({ success: true, credentials });
  } catch (err) { next(err); }
}

export async function saveCredential(req, res, next) {
  try {
    const credential = await DiscoverySettingsService.saveCredential(req.body, req.user);
    res.status(200).json({ success: true, credential, message: 'Credential saved in vault.' });
  } catch (err) { next(err); }
}

export async function deleteCredential(req, res, next) {
  try {
    const deleted = await DiscoverySettingsService.deleteCredential(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ success: false, message: 'Credential not found' });
    res.json({ success: true, message: 'Credential removed from vault.' });
  } catch (err) { next(err); }
}

export async function testCredential(req, res, next) {
  try {
    const result = await DiscoverySettingsService.testCredential(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

// 3. Connectors
export async function getConnectors(req, res, next) {
  try {
    const connectors = await DiscoverySettingsService.getConnectors();
    res.json({ success: true, connectors });
  } catch (err) { next(err); }
}

export async function saveConnector(req, res, next) {
  try {
    const connector = await DiscoverySettingsService.saveConnector(req.body, req.user);
    res.status(200).json({ success: true, connector, message: 'Connector configuration saved.' });
  } catch (err) { next(err); }
}

export async function deleteConnector(req, res, next) {
  try {
    const deleted = await DiscoverySettingsService.deleteConnector(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ success: false, message: 'Connector not found' });
    res.json({ success: true, message: 'Connector removed.' });
  } catch (err) { next(err); }
}

export async function testConnector(req, res, next) {
  try {
    const result = await DiscoverySettingsService.testConnector(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

export async function syncConnector(req, res, next) {
  try {
    const result = await DiscoverySettingsService.syncConnector(req.params.id, req.user);
    res.json(result);
  } catch (err) { next(err); }
}

// 4. Matching Rules
export async function getMatchingRules(req, res, next) {
  try {
    const rules = await DiscoverySettingsService.getMatchingRules();
    res.json({ success: true, rules });
  } catch (err) { next(err); }
}

export async function updateMatchingRules(req, res, next) {
  try {
    const result = await DiscoverySettingsService.updateMatchingRules(req.body.rules || req.body, req.user);
    res.json(result);
  } catch (err) { next(err); }
}

export async function resetMatchingRules(req, res, next) {
  try {
    const rules = await DiscoverySettingsService.resetMatchingRules(req.user);
    res.json({ success: true, rules, message: 'Matching rules reset to factory defaults.' });
  } catch (err) { next(err); }
}

// 5. Device Classification Mappings
export async function getClassificationRules(req, res, next) {
  try {
    const rules = await DiscoverySettingsService.getClassificationRules();
    res.json({ success: true, rules });
  } catch (err) { next(err); }
}

export async function saveClassificationRule(req, res, next) {
  try {
    const rule = await DiscoverySettingsService.saveClassificationRule(req.body, req.user);
    res.status(200).json({ success: true, rule, message: 'Classification rule saved.' });
  } catch (err) { next(err); }
}

export async function deleteClassificationRule(req, res, next) {
  try {
    const deleted = await DiscoverySettingsService.deleteClassificationRule(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ success: false, message: 'Rule not found' });
    res.json({ success: true, message: 'Classification rule deleted.' });
  } catch (err) { next(err); }
}

// 6. Discovery Schedules
export async function getSchedules(req, res, next) {
  try {
    const schedules = await DiscoverySettingsService.getSchedules();
    res.json({ success: true, schedules });
  } catch (err) { next(err); }
}

export async function saveSchedule(req, res, next) {
  try {
    const schedule = await DiscoverySettingsService.saveSchedule(req.body, req.user);
    res.status(200).json({ success: true, schedule, message: 'Discovery schedule saved.' });
  } catch (err) { next(err); }
}

export async function toggleSchedule(req, res, next) {
  try {
    const schedule = await DiscoverySettingsService.toggleSchedule(req.params.id, req.user);
    res.json({ success: true, schedule, message: `Schedule status updated.` });
  } catch (err) { next(err); }
}

export async function deleteSchedule(req, res, next) {
  try {
    const deleted = await DiscoverySettingsService.deleteSchedule(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, message: 'Schedule deleted.' });
  } catch (err) { next(err); }
}

// 7. Global Settings
export async function getGlobalSettings(req, res, next) {
  try {
    const settings = await DiscoverySettingsService.getGlobalSettings();
    res.json({ success: true, settings });
  } catch (err) { next(err); }
}

export async function updateGlobalSettings(req, res, next) {
  try {
    const settings = await DiscoverySettingsService.updateGlobalSettings(req.body, req.user);
    res.json({ success: true, settings, message: 'Global discovery settings saved.' });
  } catch (err) { next(err); }
}

// 8. Audit Logs
export async function getDiscoveryAuditLogs(req, res, next) {
  try {
    const logs = await DiscoverySettingsService.getAuditLogs();
    res.json({ success: true, logs });
  } catch (err) { next(err); }
}
