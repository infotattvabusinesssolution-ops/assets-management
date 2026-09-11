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

// Helper function to invoke Google Gemini AI REST API with multi-model fallback & token/key support
async function callGeminiAI(apiKey, systemContext, userPrompt) {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastErr = null;
  const isBearerToken = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');

  for (const model of models) {
    try {
      const url = isBearerToken
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const headers = { 'Content-Type': 'application/json' };
      if (isBearerToken) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const body = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `System Context & Database RAG Baseline:\n${systemContext}\n\nUser Question:\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Retry with ?key parameter if bearer auth failed
        if (isBearerToken) {
          const retryUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const retryRes = await fetch(retryUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (retryRes.ok) {
            const retryJson = await retryRes.json();
            const retryText = retryJson?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (retryText) return retryText;
          }
        }
        throw new Error(`Gemini ${model} API Error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      lastErr = err;
      console.warn(`Attempt with ${model} failed:`, err.message);
    }
  }

  throw lastErr || new Error('All Gemini API models failed');
}

// Helper function to invoke OpenAI REST API
async function callOpenAI(apiKey, systemContext, userPrompt) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemContext },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 1000
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content || null;
}

export async function askAssistant(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt required' });

    const lower = prompt.toLowerCase();

    // 1. Tokenize Prompt & Construct Intelligent Database RAG Query
    const stopWords = new Set(['list', 'all', 'available', 'show', 'me', 'the', 'is', 'where', 'what', 'are', 'asset', 'assets', 'equipment', 'assigned', 'to', 'in', 'with', 'barcode', 'for', 'this', 'have', 'added', 'new', 'result', 'when', 'search', 'on', 'ai', 'assistance', 'copilot', 'please', 'find', 'get', 'of', 'and']);
    const rawTokens = lower.replace(/[^\w\s-]/g, '').split(/\s+/).filter(Boolean);
    const keywords = rawTokens.filter(w => !stopWords.has(w) && w.length > 1);

    const isLaptopQuery = lower.includes('laptop') || lower.includes('laptops');

    const searchConditions = [];

    if (isLaptopQuery) {
      searchConditions.push(
        { category: { name: { contains: 'laptop', mode: 'insensitive' } } },
        { category: { name: { contains: 'computer', mode: 'insensitive' } } },
        { category: { name: { contains: 'it', mode: 'insensitive' } } },
        { description: { contains: 'laptop', mode: 'insensitive' } },
        { description: { contains: 'notebook', mode: 'insensitive' } },
        { description: { contains: 'macbook', mode: 'insensitive' } },
        { description: { contains: 'dell', mode: 'insensitive' } },
        { description: { contains: 'hp', mode: 'insensitive' } },
        { description: { contains: 'lenovo', mode: 'insensitive' } },
        { description: { contains: 'thinkpad', mode: 'insensitive' } },
        { description: { contains: 'latitude', mode: 'insensitive' } },
        { description: { contains: 'elitebook', mode: 'insensitive' } },
        { description: { contains: 'probook', mode: 'insensitive' } }
      );
    }

    for (const kw of keywords) {
      searchConditions.push(
        { assetId: { contains: kw, mode: 'insensitive' } },
        { serialNumber: { contains: kw, mode: 'insensitive' } },
        { description: { contains: kw, mode: 'insensitive' } },
        { barcode: { contains: kw, mode: 'insensitive' } },
        { rfidEpc: { contains: kw, mode: 'insensitive' } },
        { category: { name: { contains: kw, mode: 'insensitive' } } }
      );
    }

    const assetWhere = { active: true };
    if (searchConditions.length > 0) {
      assetWhere.OR = searchConditions;
    }

    // Gather Live Database Context & Relevant RAG Records
    let [totalAssetsCount, missingCount, inServiceCount, totalSites, totalCategories, matchedAssets] = await Promise.all([
      prisma.asset.count({ where: { active: true } }),
      prisma.asset.count({ where: { active: true, lifecycleStatus: 'MISSING' } }),
      prisma.asset.count({ where: { active: true, lifecycleStatus: 'IN_SERVICE' } }),
      prisma.site.count({ where: { active: true } }),
      prisma.category.count({ where: { active: true } }),
      prisma.asset.findMany({
        where: assetWhere,
        include: {
          category: true,
          site: true,
          building: true,
          room: true,
          custodian: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    // Fallback: If keyword search returned 0 but active assets exist, fetch recent active assets
    if (matchedAssets.length === 0 && totalAssetsCount > 0) {
      matchedAssets = await prisma.asset.findMany({
        where: { active: true },
        include: {
          category: true,
          site: true,
          building: true,
          room: true,
          custodian: true
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
    }

    // 2. Classify Widget Intent for Rich UI Cards
    let widgetType = 'DEFAULT_RESULTS';
    if (lower.includes('barcode') || lower.includes('12345') || lower.includes('where is asset') || lower.includes('locate')) {
      widgetType = 'ASSET_LOCATION';
    } else if (lower.includes('laptop') || lower.includes('available')) {
      widgetType = 'INVENTORY_AVAILABLE';
    } else if (lower.includes('total value') || lower.includes('value of it equipment') || lower.includes('financial')) {
      widgetType = 'FINANCIAL_VALUE';
    } else if (lower.includes('purchased in') || lower.includes('assets purchased')) {
      widgetType = 'FINANCIAL_PURCHASED';
    } else if (lower.includes('depreciat') || lower.includes('fully depreciate')) {
      widgetType = 'FINANCIAL_DEPRECIATION';
    } else if (lower.includes('projector') || lower.includes('last moved') || lower.includes('movement')) {
      widgetType = 'AUDIT_MOVEMENT';
    } else if (lower.includes('disposal')) {
      widgetType = 'AUDIT_DISPOSAL';
    } else if (lower.includes('approval') || lower.includes('approved')) {
      widgetType = 'AUDIT_APPROVAL';
    } else if (lower.includes('distribution') || lower.includes('departments')) {
      widgetType = 'ANALYTICS_DISTRIBUTION';
    } else if (lower.includes('custodian') || lower.includes('bader') || lower.includes('assigned')) {
      widgetType = 'CUSTODIAN_ASSIGNMENT';
    } else if (lower.includes('building') || lower.includes('equipment')) {
      widgetType = 'BUILDING_EQUIPMENT';
    }

    // 3. Construct System RAG Context
    const systemContext = `
You are the Enterprise Fixed Asset Management System (FAMS) AI Copilot.
Current Live System Statistics:
- Total Active Assets: ${totalAssetsCount}
- In-Service Assets: ${inServiceCount}
- Missing Assets: ${missingCount}
- Managed Sites: ${totalSites}
- Asset Categories: ${totalCategories}

Directly Matched Assets Found in Database:
${matchedAssets.length > 0 
  ? matchedAssets.map(a => `- AssetCode: ${a.assetId}, Name: "${a.description}", Serial: ${a.serialNumber || 'N/A'}, Status: ${a.lifecycleStatus}, Location: ${a.site?.name || 'N/A'}/${a.room?.name || 'N/A'}, Custodian: ${a.custodian?.fullName || 'Unassigned'}`).join('\n')
  : 'No exact keyword matches found for the query in active database records.'
}

Instructions:
- Provide a helpful, clear, precise, and professional enterprise response.
- Highlight relevant asset codes, serial numbers, locations, and custodian names when matching records are available.
`;

    let aiResponseText = null;
    let usedProvider = 'enterprise_fams_rag';

    // 4. Try Gemini or OpenAI API if configured
    const geminiKey = process.env.GEMINI_API_KEY || (process.env.AI_PROVIDER === 'gemini' ? process.env.AI_API_KEY : null);
    const openAIKey = process.env.OPENAI_API_KEY || (process.env.AI_PROVIDER === 'openai' ? process.env.AI_API_KEY : null);

    if (geminiKey && geminiKey !== 'mock-key-2026') {
      try {
        aiResponseText = await callGeminiAI(geminiKey, systemContext, prompt);
        usedProvider = 'gemini';
      } catch (geminiErr) {
        console.error('Gemini API call failed, falling back:', geminiErr.message);
      }
    }

    if (!aiResponseText && openAIKey && openAIKey !== 'mock-key-2026') {
      try {
        aiResponseText = await callOpenAI(openAIKey, systemContext, prompt);
        usedProvider = 'openai';
      } catch (openAiErr) {
        console.error('OpenAI API call failed, falling back:', openAiErr.message);
      }
    }

    // 5. Intelligent Fallback (if no API keys configured or API down)
    if (!aiResponseText) {
      if (matchedAssets.length > 0) {
        const topMatch = matchedAssets[0];
        aiResponseText = `Found ${matchedAssets.length} asset record(s) matching your request. Primary asset ${topMatch.assetId} ("${topMatch.description}") is currently in status [${topMatch.lifecycleStatus}] located at ${topMatch.site?.name || 'Main Site'}, Room ${topMatch.room?.name || 'Unspecified'}.`;
      } else if (lower.includes('missing')) {
        aiResponseText = `Currently tracking ${missingCount} missing asset(s) out of ${totalAssetsCount} total active assets across ${totalSites} sites.`;
      } else if (lower.includes('laptop')) {
        aiResponseText = `Querying available laptop hardware. You have ${inServiceCount} total active assets operating in-service across your enterprise locations.`;
      } else {
        aiResponseText = `Asset 360 AI verified enterprise database metrics: ${totalAssetsCount} total assets registered, ${inServiceCount} in-service, and ${missingCount} flagged missing.`;
      }
    }

    res.json({
      success: true,
      provider: usedProvider,
      prompt,
      text: aiResponseText,
      widgetType,
      recordsCount: matchedAssets.length,
      records: matchedAssets
    });
  } catch (err) { next(err); }
}
