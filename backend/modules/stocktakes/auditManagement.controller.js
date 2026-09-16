/**
 * Audit Management Controller
 * Exposes endpoints for listing campaigns, estimating scope population,
 * creating audits, updating status/snapshotting, and final reconciliation reporting.
 */
import * as service from './auditManagement.service.js';

export async function getAudits(req, res, next) {
  try {
    const { search, status, auditType, entity, location } = req.query;
    const audits = await service.getAudits({ search, status, auditType, entity, location });
    res.json({ success: true, count: audits.length, audits });
  } catch (err) {
    next(err);
  }
}

export async function getAuditById(req, res, next) {
  try {
    const { id } = req.params;
    const audit = await service.getAuditById(id);
    res.json({ success: true, audit });
  } catch (err) {
    next(err);
  }
}

export async function estimateScope(req, res, next) {
  try {
    const scopePayload = req.body;
    const result = await service.estimateScope(scopePayload);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function createAudit(req, res, next) {
  try {
    const payload = req.body;
    const audit = await service.createAudit(payload, req.user);
    res.status(201).json({
      success: true,
      message: payload.isDraft ? 'Audit campaign saved as Draft' : 'Audit campaign created successfully and submitted for approval',
      audit
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateAuditStatus(req, res, next) {
  try {
    const { id } = req.params;
    const actionPayload = req.body;
    const updatedAudit = await service.updateAuditStatus(id, actionPayload, req.user);
    res.json({
      success: true,
      message: `Audit status transitioned to ${updatedAudit.status}`,
      audit: updatedAudit
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getReconciliationReport(req, res, next) {
  try {
    const { id } = req.params;
    const audit = await service.getAuditById(id);
    if (!audit.finalReconciliationReport) {
      return res.status(400).json({
        success: false,
        message: 'Reconciliation report is only available for closed audit campaigns.'
      });
    }
    res.json({ success: true, report: audit.finalReconciliationReport, audit });
  } catch (err) {
    next(err);
  }
}
