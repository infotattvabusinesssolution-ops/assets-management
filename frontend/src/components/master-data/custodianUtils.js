/**
 * Utility functions for custodian and employee deduplication
 * Ensures that custodians synced from the backend and cached in localStorage
 * are merged without duplicates across id, employeeCode, email, and fullName.
 */

export const deduplicateCustodians = (...lists) => {
  const seenIds = new Set();
  const seenCodes = new Set();
  const seenNames = new Set();
  const seenEmails = new Set();
  const result = [];

  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const c of list) {
      if (!c || typeof c !== 'object') continue;
      const id = c.id != null ? String(c.id).trim().toLowerCase() : '';
      const code = String(c.employeeCode || c.code || '').trim().toLowerCase();
      const name = String(c.fullName || c.name || '').trim().toLowerCase();
      const email = String(c.email || '').trim().toLowerCase();

      // Check if already seen by id, code, full name, or email
      if (id && seenIds.has(id)) continue;
      if (code && seenCodes.has(code)) continue;
      if (name && seenNames.has(name)) continue;
      if (email && seenEmails.has(email)) continue;

      if (id) seenIds.add(id);
      if (code) seenCodes.add(code);
      if (name) seenNames.add(name);
      if (email) seenEmails.add(email);
      result.push(c);
    }
  }
  return result;
};

