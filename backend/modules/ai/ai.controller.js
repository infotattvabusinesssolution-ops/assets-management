import prisma from '../../config/prisma.js';

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

    const recommendation = await prisma.aIRecommendation.create({
      data: {
        type: 'DOCUMENT_OCR',
        confidenceScore: 95,
        recommendationPayload: mockExtracted,
        explanation: `Extracted key metadata from document [${documentName}] with 94.5% confidence.`
      }
    });

    res.json({ success: true, extracted: mockExtracted, recommendation });
  } catch (err) { next(err); }
}

export async function checkDuplicates(req, res, next) {
  try {
    const assets = await prisma.asset.findMany({ where: { active: true } });
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
    const asset = await prisma.asset.findFirst({
      where: {
        OR: [
          { id: assetId },
          { assetId }
        ]
      }
    });

    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

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

    res.json({ success: true, assetId: asset.id, healthScore: score, factors });
  } catch (err) { next(err); }
}

export async function askAssistant(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt required' });

    const lower = prompt.toLowerCase();
    const where = { active: true };
    let explanation = 'Converted prompt into Prisma filter query.';

    if (lower.includes('missing')) {
      where.lifecycleStatus = 'MISSING';
      explanation = 'Filtered assets with lifecycleStatus = MISSING';
    } else if (lower.includes('service') || lower.includes('active')) {
      where.lifecycleStatus = 'IN_SERVICE';
      explanation = 'Filtered assets with lifecycleStatus = IN_SERVICE';
    } else if (lower.includes('dell')) {
      where.description = { contains: 'Dell', mode: 'insensitive' };
      explanation = 'Filtered assets matching description [Dell]';
    }

    const records = await prisma.asset.findMany({
      where,
      include: { category: true, site: true },
      take: 20
    });

    res.json({
      success: true,
      prompt,
      appliedFilter: where,
      explanation,
      resultsCount: records.length,
      records
    });
  } catch (err) { next(err); }
}
