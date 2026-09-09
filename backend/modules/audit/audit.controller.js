import { AuditEvent } from '../../models/AuditEvent.js';

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await AuditEvent.find()
      .populate('userId')
      .sort({ timestamp: -1 })
      .limit(200);

    res.json({ success: true, logs });
  } catch (err) { next(err); }
}
