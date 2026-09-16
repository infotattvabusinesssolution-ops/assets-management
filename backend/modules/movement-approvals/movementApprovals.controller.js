import MovementApprovalsService from './movementApprovals.service.js';

export async function getMovementApprovals(req, res, next) {
  try {
    const data = await MovementApprovalsService.getApprovalRequests(req.query);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

export async function getApprovalKpis(req, res, next) {
  try {
    const kpis = await MovementApprovalsService.getKpis();
    res.json({ success: true, data: kpis });
  } catch (err) {
    next(err);
  }
}

export async function getApprovalRequestDetails(req, res, next) {
  try {
    const { id } = req.params;
    const request = await MovementApprovalsService.getApprovalRequestById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Movement approval request not found' });
    }
    res.json({ success: true, request });
  } catch (err) {
    next(err);
  }
}

export async function submitApprovalDecision(req, res, next) {
  try {
    const { id } = req.params;
    const {
      decision,
      comments,
      attachments,
      notifyRequester,
      notifyNextApprover,
      additionalRecipients
    } = req.body;

    const result = await MovementApprovalsService.processDecision({
      requestId: id,
      decision,
      comments,
      attachments,
      notifyRequester,
      notifyNextApprover,
      additionalRecipients,
      user: req.user
    });

    res.json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function bulkSubmitDecisions(req, res, next) {
  try {
    const { requestIds, decision, comments } = req.body;
    const result = await MovementApprovalsService.bulkProcessDecisions({
      requestIds,
      decision,
      comments,
      user: req.user
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function exportMovementApprovals(req, res, next) {
  try {
    const result = await MovementApprovalsService.exportApprovals(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
