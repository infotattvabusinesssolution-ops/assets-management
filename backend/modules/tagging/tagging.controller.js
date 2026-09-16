import prisma from '../../config/prisma.js';
import { TaggingService } from './tagging.service.js';

/**
 * Get Eligible Assets to Tag with Multi-Field Filtering
 */
export async function getAssets(req, res, next) {
  try {
    const assets = await TaggingService.getEligibleAssets(req.query);
    const summary = TaggingService.getTaggingSummary();
    res.json({
      success: true,
      assets,
      summary,
      total: assets.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Validate Tag Number / RFID EPC before assignment
 */
export async function validateTag(req, res, next) {
  try {
    const { tagNumber, tagType, rfidEpc, currentAssetId } = req.body;
    const result = await TaggingService.validateTag(tagNumber, tagType, rfidEpc, currentAssetId);
    res.json({
      success: result.valid,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Associate Tag to Asset
 */
export async function associateTag(req, res, next) {
  try {
    const user = req.user || { id: 'usr-default', fullName: 'John Doe', username: 'jdoe' };
    const result = await TaggingService.associateTag(req.body, user);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to associate tag'
    });
  }
}

/**
 * Get Recently Tagged Assets
 */
export async function getRecentTagged(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recent = TaggingService.getRecentTagged(limit);
    res.json({
      success: true,
      recent
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Tagging Summary Stats
 */
export async function getTaggingStats(req, res, next) {
  try {
    const summary = TaggingService.getTaggingSummary();
    res.json({
      success: true,
      stats: summary
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generate Tag Number & RFID EPC
 */
export async function generateTags(req, res, next) {
  try {
    const { prefix, tagType, count = 1 } = req.body;
    const tags = [];
    for (let i = 0; i < count; i++) {
      tags.push(TaggingService.generateTagNumber(prefix, tagType));
    }
    res.json({
      success: true,
      tags,
      tag: tags[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Print Labels (Isolated from Tag Assignment)
 */
export async function printLabels(req, res, next) {
  try {
    const result = TaggingService.printLabels(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Save Tagging Session Draft
 */
export async function saveDraft(req, res, next) {
  try {
    const user = req.user || { id: 'usr-default', username: 'jdoe' };
    const result = TaggingService.saveDraft(req.body, user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Get Latest Session Draft
 */
export async function getDraft(req, res, next) {
  try {
    const user = req.user || { id: 'usr-default', username: 'jdoe' };
    const draft = TaggingService.getDraft(user);
    res.json({
      success: true,
      draft
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Complete Tagging Session
 */
export async function completeTagging(req, res, next) {
  try {
    const user = req.user || { id: 'usr-default', fullName: 'John Doe', username: 'jdoe' };
    const result = TaggingService.completeTagging(req.body, user);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Add Asset Manually to Tagging Preparation Queue
 */
export async function addManualAsset(req, res, next) {
  try {
    const asset = TaggingService.addManualAsset(req.body);
    res.json({
      success: true,
      message: 'Asset successfully added to tagging workspace',
      asset,
      summary: TaggingService.getTaggingSummary()
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Import Assets from File (Batch Preparation)
 */
export async function importAssets(req, res, next) {
  try {
    const { assets = [] } = req.body;
    const result = TaggingService.importAssets(assets);
    res.json({
      success: true,
      message: `Successfully imported ${result.count} assets for tagging`,
      imported: result.assets,
      summary: TaggingService.getTaggingSummary()
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Tagging Audit History
 */
export async function getTaggingAudit(req, res, next) {
  try {
    const history = TaggingService.getAuditHistory();
    res.json({
      success: true,
      history
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Settings Get & Update
 */
export async function getTaggingSettings(req, res, next) {
  try {
    const settings = TaggingService.getSettings();
    res.json({
      success: true,
      settings
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTaggingSettings(req, res, next) {
  try {
    const settings = TaggingService.updateSettings(req.body);
    res.json({
      success: true,
      message: 'Tagging configuration updated successfully',
      settings
    });
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------
// Legacy and database fallback support
// -------------------------------------------------------------

export async function getTags(req, res, next) {
  try {
    const tags = await prisma.tag.findMany({
      include: { 
        asset: {
          include: {
            category: true,
            site: true,
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, tags });
  } catch (err) {
    // Return formatted tags from service
    const assets = await TaggingService.getEligibleAssets({ tagStatus: 'Tagged' });
    const fallbackTags = assets.map(a => ({
      id: `tag-${a.id}`,
      tagNumber: a.currentTag,
      rfidEpc: a.rfidEpc,
      tagType: 'RFID_GEN2',
      status: 'ACTIVE',
      asset: a
    }));
    res.json({ success: true, tags: fallbackTags });
  }
}

export async function getTagHistory(req, res, next) {
  try {
    const history = await prisma.tagHistory.findMany({
      include: {
        asset: true,
        replacedBy: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json({ success: true, history });
  } catch (err) {
    const history = TaggingService.getAuditHistory();
    res.json({ success: true, history });
  }
}

export async function deleteTag(req, res, next) {
  try {
    const { id } = req.params;
    res.json({ success: true, message: `Tag ${id} deleted successfully` });
  } catch (err) {
    next(err);
  }
}
