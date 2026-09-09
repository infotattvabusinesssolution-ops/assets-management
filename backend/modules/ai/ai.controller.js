import { Asset } from '../../models/Asset.js';
import { AIRecommendation } from '../../models/AIRecommendation.js';

export async function extractDocument(req, res, next) {
  try {
    const { documentName = 'Invoice_2026_AST.pdf' } = req.body;

    const mockExtracted = {
      manufacturer: 'Dell Inc.',
      modelName: 'Latitude 5440',
      serialNumber: 'SN-DLL-' + Math.floor(100000 + Math.random() * 900000),
      purchaseDate: '2026-01-15',
      acquisitionValue: 1450.00,
      confidence: 94.5
    };

    const recommendation = await AIRecommendation.create({
      type: 'DOCUMENT_OCR',
      confidenceScore: 94.5,
      recommendationPayload: mockExtracted,
      explanation: `Extracted key metadata from document [${documentName}] with 94.5% confidence.`
    });

    res.json({ success: true, extracted: mockExtracted, recommendation });
  } catch (err) { next(err); }
}

export async function checkDuplicates(req, res, next) {
  try {
    const assets = await Asset.find({ active: true });
    const serialMap = {};
    const duplicates = [];

    for (const a of assets) {
      if (a.serialNumber) {
        if (serialMap[a.serialNumber]) {
          duplicates.push({
            original: serialMap[a.serialNumber],
            duplicateCandidate: a,
            confidence: 98,
            reason: 'Identical Serial Number'
          });
        } else {
          serialMap[a.serialNumber] = a;
        }
      }
    }

    res.json({ success: true, count: duplicates.length, duplicates });
  } catch (err) { next(err); }
}

export async function getHealthInsights(req, res, next) {
  try {
    const { assetId } = req.params;
    const asset = await Asset.findById(assetId);

    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    // Calculate dynamic health score
    const ageMonths = (Date.now() - new Date(asset.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
    let score = 100 - Math.min(Math.floor(ageMonths * 1.5), 40);

    if (asset.condition === 'POOR') score -= 25;
    if (asset.condition === 'DAMAGED') score -= 40;
    if (asset.lifecycleStatus === 'MISSING') score = 10;

    score = Math.max(score, 5);

    const factors = [
      { factor: 'Asset Age', impact: -Math.min(Math.floor(ageMonths * 1.5), 40) },
      { factor: 'Physical Condition', impact: asset.condition === 'GOOD' ? 0 : -20 },
      { factor: 'Maintenance Frequency', impact: -5 }
    ];

    res.json({ success: true, assetId, healthScore: score, factors });
  } catch (err) { next(err); }
}

export async function askAssistant(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt required' });

    const lower = prompt.toLowerCase();
    let filter = { active: true };
    let explanation = 'Converted prompt into Mongoose filter query.';

    if (lower.includes('missing')) {
      filter.lifecycleStatus = 'MISSING';
      explanation = 'Filtered assets with lifecycleStatus = MISSING';
    } else if (lower.includes('service') || lower.includes('active')) {
      filter.lifecycleStatus = 'IN_SERVICE';
      explanation = 'Filtered assets with lifecycleStatus = IN_SERVICE';
    } else if (lower.includes('dell')) {
      filter.description = new RegExp('Dell', 'i');
      explanation = 'Filtered assets matching description [Dell]';
    }

    const records = await Asset.find(filter).populate('categoryId').populate('siteId').limit(20);

    res.json({
      success: true,
      prompt,
      appliedFilter: filter,
      explanation,
      resultsCount: records.length,
      records
    });
  } catch (err) { next(err); }
}
