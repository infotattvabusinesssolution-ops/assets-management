import { CustodyAssignment } from '../../models/CustodyAssignment.js';
import { AssetTransfer } from '../../models/AssetTransfer.js';
import { Asset } from '../../models/Asset.js';
import { AssetTransaction } from '../../models/AssetTransaction.js';
import { withTransaction } from '../../config/db.js';

export async function getCustodyAssignments(req, res, next) {
  try {
    const assignments = await CustodyAssignment.find()
      .populate({
        path: 'assetId',
        populate: [
          { path: 'categoryId' },
          { path: 'siteId' },
          { path: 'roomId' }
        ]
      })
      .populate({
        path: 'custodianId',
        populate: { path: 'departmentId' }
      })
      .populate('issuedBy')
      .sort({ createdAt: -1 });

    res.json({ success: true, assignments });
  } catch (err) { next(err); }
}

export async function assignCustody(req, res, next) {
  try {
    const { assetId, custodianId, expectedReturnDate, notes } = req.body;

    const result = await withTransaction(async (session) => {
      const asset = await Asset.findById(assetId);
      if (!asset) throw new Error('Asset not found');

      // Deactivate active assignments
      await CustodyAssignment.updateMany(
        { assetId: asset._id, active: true },
        { active: false },
        { session }
      );

      const [assignment] = await CustodyAssignment.create([{
        assetId: asset._id,
        custodianId,
        issuedDate: new Date(),
        expectedReturnDate,
        issuedBy: req.user._id,
        active: true
      }], { session });

      asset.custodianId = custodianId;
      asset.assignedDate = new Date();
      asset.lifecycleStatus = 'ASSIGNED';
      await asset.save({ session });

      await AssetTransaction.create([{
        assetId: asset._id,
        transactionType: 'ASSIGN',
        fromStatus: 'TAGGED',
        toStatus: 'ASSIGNED',
        performedBy: req.user._id,
        notes: notes || 'Assigned custodian'
      }], { session });

      return assignment;
    });

    res.status(201).json({ success: true, assignment: result });
  } catch (err) { next(err); }
}

export async function returnCustody(req, res, next) {
  try {
    const { id } = req.params;
    const { conditionAtReturn, notes } = req.body;

    const result = await withTransaction(async (session) => {
      const assignment = await CustodyAssignment.findById(id).session(session);
      if (!assignment) throw new Error('Custody assignment not found');
      if (!assignment.active) throw new Error('Custody assignment is already inactive');

      assignment.active = false;
      assignment.actualReturnDate = new Date();
      if (conditionAtReturn) assignment.conditionAtReturn = conditionAtReturn;
      await assignment.save({ session });

      const asset = await Asset.findById(assignment.assetId).session(session);
      if (asset) {
        asset.custodianId = null;
        asset.lifecycleStatus = 'IN_STORE';
        await asset.save({ session });

        await AssetTransaction.create([{
          assetId: asset._id,
          transactionType: 'UNASSIGN',
          fromStatus: 'ASSIGNED',
          toStatus: 'IN_STORE',
          performedBy: req.user._id,
          notes: notes || 'Custody returned to inventory'
        }], { session });
      }

      return assignment;
    });

    res.json({ success: true, assignment: result });
  } catch (err) { next(err); }
}

export async function getTransfers(req, res, next) {
  try {
    const transfers = await AssetTransfer.find()
      .populate({
        path: 'assetId',
        populate: [
          { path: 'categoryId' },
          { path: 'siteId' },
          { path: 'roomId' }
        ]
      })
      .populate('fromCompanyId')
      .populate('fromSiteId')
      .populate('fromRoomId')
      .populate('fromCustodianId')
      .populate('toCompanyId')
      .populate('toSiteId')
      .populate('toRoomId')
      .populate('toCustodianId')
      .populate('requestedBy')
      .sort({ createdAt: -1 });

    res.json({ success: true, transfers });
  } catch (err) { next(err); }
}

export async function createTransfer(req, res, next) {
  try {
    const transferNumber = 'TRF-' + Date.now().toString(36).toUpperCase();
    const transfer = await AssetTransfer.create({
      ...req.body,
      transferNumber,
      requestedBy: req.user._id,
      status: 'APPROVED' // Auto-approve for seamless flow
    });

    // Update Asset Location & status
    const asset = await Asset.findById(req.body.assetId);
    if (asset) {
      if (req.body.toSiteId) asset.siteId = req.body.toSiteId;
      if (req.body.toRoomId) asset.roomId = req.body.toRoomId;
      if (req.body.toCustodianId) asset.custodianId = req.body.toCustodianId;
      asset.lifecycleStatus = 'IN_SERVICE';
      await asset.save();

      await AssetTransaction.create({
        assetId: asset._id,
        transactionType: 'TRANSFER_LOCATION',
        fromStatus: 'IN_TRANSIT',
        toStatus: 'IN_SERVICE',
        performedBy: req.user._id,
        notes: `Transfer completed: ${transferNumber}`
      });
    }

    res.status(201).json({ success: true, transfer });
  } catch (err) { next(err); }
}

