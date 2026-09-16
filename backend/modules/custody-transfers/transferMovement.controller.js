/**
 * Transfer & Movement Controller
 * Exposes API endpoints for searching eligible assets, location hierarchy,
 * single and bulk transfer creation (draft & submission), workflow status transitions,
 * and immutable movement history auditing.
 */
import * as service from './transferMovement.service.js';

export async function getLocationHierarchy(req, res, next) {
  try {
    const hierarchy = await service.getLocationHierarchy();
    res.json({ success: true, ...hierarchy });
  } catch (err) {
    next(err);
  }
}

export async function getMasterReferences(req, res, next) {
  try {
    const refs = await service.getMasterReferences();
    res.json({ success: true, ...refs });
  } catch (err) {
    next(err);
  }
}

export async function searchEligibleAssets(req, res, next) {
  try {
    const { q, scanType } = req.query;
    const assets = await service.searchEligibleAssets({ query: q, scanType });
    res.json({ success: true, count: assets.length, assets });
  } catch (err) {
    next(err);
  }
}

export async function scanAsset(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Scan code is required' });
    }
    const result = await service.scanAsset(code);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getTransfers(req, res, next) {
  try {
    const { status, search } = req.query;
    const transfers = await service.getTransfers({ status, search });
    res.json({ success: true, count: transfers.length, transfers });
  } catch (err) {
    next(err);
  }
}

export async function getTransferById(req, res, next) {
  try {
    const { id } = req.params;
    const transfer = await service.getTransferById(id);
    res.json({ success: true, transfer });
  } catch (err) {
    next(err);
  }
}

export async function createTransfer(req, res, next) {
  try {
    const payload = req.body;
    const transfer = await service.createTransfer(payload, req.user);
    res.status(201).json({
      success: true,
      message: payload.isDraft ? 'Transfer saved as draft' : 'Transfer submitted successfully',
      transfer
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateTransferStatus(req, res, next) {
  try {
    const { id } = req.params;
    const actionPayload = req.body;
    const updatedTransfer = await service.updateTransferStatus(id, actionPayload, req.user);
    res.json({
      success: true,
      message: `Transfer status updated successfully to ${updatedTransfer.status}`,
      transfer: updatedTransfer
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getMovementHistory(req, res, next) {
  try {
    const { assetId, transferId, search } = req.query;
    const history = await service.getMovementHistory({ assetId, transferId, search });
    res.json({ success: true, count: history.length, history });
  } catch (err) {
    next(err);
  }
}
