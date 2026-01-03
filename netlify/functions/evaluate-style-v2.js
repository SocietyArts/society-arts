/**
 * evaluate-style-v2.js
 * 
 * Netlify serverless function for AI-powered style classification
 * Uses 3-step cascade: Art Medium → Subcategory → Specific Technique
 * 
 * All three confidence scores are returned for outlier analysis
 */

const ART_MEDIUMS = {
  'AMD001': { name: 'Bold Paint (Oil/Acrylic)', category: 'Painting', visual_cues: 'Thick, dimensional, textured surface; visible brushstrokes, impasto texture, layered paint, rich color depth, canvas texture implied' },
  'AMD002': { name: 'Fluid Paint (Watercolor)', category: 'Painting', visual_cues: 'Wet, flowing, organic spread patterns; translucent washes, soft edges, bleeding colors, white of paper showing through, granulation, blooms' },
  'AMD003': { name: 'Flat Paint (Poster/Gouache)', category: 'Painting', visual_cues: 'Smooth, chalky, velvety surface; matte, opaque, uniform color fields, minimal visible brushwork, clean color blocks, graphic quality' },
  'AMD004': { name: 'Sketch (Pencil/Graphite)', category: 'Drawing', visual_cues: 'Gray tonal range, soft shading, visible pencil strokes, hatching, paper texture may show, graphite sheen' },
  'AMD005': { name: 'Bold Line (Ink/Charcoal)', category: 'Drawing', visual_cues: 'Strong black lines, high contrast, expressive marks, gestural quality, clean whites against rich blacks, varied line weight' },
  'AMD006': { name: 'Color Drawing (Pastel/Colored Pencil)', category: 'Drawing', visual_cues: 'Waxy or chalky colored strokes, visible drawing marks in color, tooth of paper visible, blended color gradients, matte color finish' },
  'AMD007': { name: 'Color Photography', category: 'Photography', visual_cues: 'Photorealistic rendering, lens effects (bokeh, depth of field), natural lighting, smooth continuous tone, photographic grain possible' },
  'AMD008': { name: 'Black & White Photography', category: 'Photography', visual_cues: 'Grayscale photorealistic image, tonal range from pure black to pure white, documentary feel, silver-gelatin aesthetic' },
  'AMD009': { name: 'Bold Carved Print (Woodcut/Linocut)', category: 'Printmaking', visual_cues: 'Strong carved lines, areas of solid black/color, wood grain texture, rough hand-carved quality, uneven ink distribution, graphic simplicity' },
  'AMD010': { name: 'Fine Line Print (Etching/Engraving)', category: 'Printmaking', visual_cues: 'Delicate cross-hatching, fine parallel lines, tonal buildup through line density, precise mechanical quality, intricate detail' },
  'AMD011': { name: 'Poster Print (Screenprint)', category: 'Printmaking', visual_cues: 'Flat color layers, slight registration shifts, halftone dots, pop-art quality, bold graphic commercial feel, limited color palette' },
  'AMD012': { name: 'Paper Collage', category: 'Collage/Mixed Media', visual_cues: 'Torn or cut paper edges, layered paper elements, visible paper textures, overlapping shapes, Matisse cut-out style' },
  'AMD013': { name: 'Photo Collage', category: 'Collage/Mixed Media', visual_cues: 'Cut/combined photographic elements, surreal photo combinations, composite imagery, dreamlike photo mashups' },
  'AMD014': { name: 'Mixed Layers', category: 'Collage/Mixed Media', visual_cues: 'Combination of painting, drawing, photos, textures in one piece; multiple distinct media visible, text elements, diverse material textures' },
  'AMD015': { name: 'Digital Graphic/Vector', category: 'Digital Art', visual_cues: 'Flat color shapes, clean mathematical curves, computational precision, no texture, perfect geometric edges, uniform color fills' },
  'AMD016': { name: '3D Render', category: 'Digital Art', visual_cues: 'Raytraced lighting, subsurface scattering, dimensional depth, CGI quality, photorealistic or stylized 3D, volumetric effects' },
  'AMD017': { name: 'Digital Painterly', category: 'Digital Art', visual_cues: 'Digital brushwork mimicking traditional painting, Procreate/Photoshop brush textures, digital color blending, may show canvas texture simulation' }
};

// Subcategories grouped by art_medium_id
// This will be populated from the database or a static file
// For now, including key mappings
const SUBCATEGORIES_BY_ART_MEDIUM = {
  'AMD001': ['Oil Painting', 'Acrylic Painting', 'Encaustic'],
  'AMD002': ['Watercolor', "Children's Book", 'Editorial', 'Comic & Manga', 'Scientific', 'Fashion'],
  'AMD003': ['Gouache', 'Fresco', 'Tempera', 'Fashion'],
  'AMD004': ['Graphite Pencil', 'Fashion'],
  'AMD005': ['Charcoal', 'Pen & Ink', "Children's Book", 'Editorial', 'Comic & Manga'],
  'AMD006': ['Colored Pencil', 'Pastels', "Children's Book"],
  'AMD007': ['Color Aesthetics', 'Contemporary Creative', 'Temporal Techniques'],
  'AMD008': ['Monochrome & Infrared', 'Alternative Processes'],
  'AMD009': ['Relief Printing'],
  'AMD010': ['Lithography', 'Scientific'],
  'AMD011': ['Screen Printing'],
  'AMD012': ['Textile Pattern Art', "Children's Book", 'Fashion'],
  'AMD013': ['Photo Editing & Compositing'],
  'AMD014': ['Monoprinting', 'Editorial', 'Fashion'],
  'AMD015': ['Vector & Graphic Art', 'Editorial', 'Fashion', 'Textile Pattern Art'],
  'AMD016': ['3D Rendering'],
  'AMD017': ['Digital Painting', 'Concept Art', "Children's Book", 'Comic & Manga']
};

// Build the Step 1 prompt
const STEP1_PROMPT = `You are an expert art classifier. Analyze this image and classify it into ONE of these 17 art medium categories.

CRITICAL RULES:
- Photography (AMD007/AMD008) = captured with a camera, shows real-world subjects with lens characteristics
- Digital Art (AMD015/AMD016/AMD017) = created digitally, may simulate traditional media but has digital tells
- If photorealistic but clearly CG/rendered, choose AMD016 (3D Render), NOT photography

CATEGORIES:
${Object.entries(ART_MEDIUMS).map(([id, m]) => `${id}: ${m.name} - ${m.visual_cues}`).join('\n')}

Respond with ONLY valid JSON:
{
  "art_medium_id": "AMD###",
  "art_medium_name": "Name",
  "confidence": 0.XX,
  "reasoning": "Brief explanation of visual evidence"
}`;

// Build the Step 2 prompt (subcategory within art_medium)
function buildStep2Prompt(artMediumId, artMediumName, subcategories, techniquesData) {
  // Group techniques by subcategory for this art_medium
  const subcatDescriptions = subcategories.map(subcat => {
    const techniques = techniquesData.filter(t => t.subcategory === subcat && t.art_medium_id === artMediumId);
    if (techniques.length === 0) return null;
    return `- ${subcat}: ${techniques.map(t => t.name).join(', ')}`;
  }).filter(Boolean).join('\n');

  return `You previously classified this image as ${artMediumName} (${artMediumId}).

Now identify which SUBCATEGORY within ${artMediumName} best matches:

${subcatDescriptions}

Respond with ONLY valid JSON:
{
  "subcategory": "Exact subcategory name",
  "confidence": 0.XX,
  "reasoning": "Brief explanation"
}`;
}

// Build the Step 3 prompt (specific technique within subcategory)
function buildStep3Prompt(artMediumId, subcategory, techniques) {
  const techniqueList = techniques.map(t => 
    `${t.id}: ${t.name}\n   Visual signature: ${t.d_feature}`
  ).join('\n\n');

  return `You classified this image as ${subcategory} within art medium ${artMediumId}.

Now identify the SPECIFIC TECHNIQUE from these options:

${techniqueList}

Focus on the distinguishing visual features described for each technique.

Respond with ONLY valid JSON:
{
  "medium_id": "MED###",
  "medium_name": "Technique Name",
  "confidence": 0.XX,
  "reasoning": "Which specific visual features matched"
}`;
}

// Main handler
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { style_id, image_url, techniques_data } = JSON.parse(event.body);

    if (!style_id || !image_url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing style_id or image_url' })
      };
    }

    console.log(`[evaluate-style-v2] Starting 3-step evaluation for style: ${style_id}`);

    // Fetch image as base64
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mediaType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // ========================================
    // STEP 1: Classify into Art Medium (17 options)
    // ========================================
    console.log('[evaluate-style-v2] Step 1: Art Medium classification...');
    
    const step1Response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image }
            },
            { type: 'text', text: STEP1_PROMPT }
          ]
        }]
      })
    });

    if (!step1Response.ok) {
      const errorText = await step1Response.text();
      throw new Error(`Step 1 API error: ${step1Response.status} - ${errorText}`);
    }

    const step1Data = await step1Response.json();
    const step1Text = step1Data.content[0].text;
    
    let step1Result;
    try {
      const jsonMatch = step1Text.match(/\{[\s\S]*\}/);
      step1Result = JSON.parse(jsonMatch ? jsonMatch[0] : step1Text);
    } catch (e) {
      throw new Error(`Step 1 JSON parse error: ${e.message}`);
    }

    console.log(`[evaluate-style-v2] Step 1 result: ${step1Result.art_medium_id} (${step1Result.confidence})`);

    // ========================================
    // STEP 2: Classify into Subcategory
    // ========================================
    console.log('[evaluate-style-v2] Step 2: Subcategory classification...');
    
    const artMediumId = step1Result.art_medium_id;
    const artMediumName = step1Result.art_medium_name || ART_MEDIUMS[artMediumId]?.name;
    const subcategories = SUBCATEGORIES_BY_ART_MEDIUM[artMediumId] || [];
    
    // Filter techniques for this art_medium
    const relevantTechniques = (techniques_data || []).filter(t => t.art_medium_id === artMediumId);
    
    let step2Result = { subcategory: null, confidence: null, reasoning: 'Skipped - no subcategories' };
    
    if (subcategories.length > 1 && relevantTechniques.length > 0) {
      const step2Prompt = buildStep2Prompt(artMediumId, artMediumName, subcategories, relevantTechniques);
      
      const step2Response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Image }
              },
              { type: 'text', text: step2Prompt }
            ]
          }]
        })
      });

      if (step2Response.ok) {
        const step2Data = await step2Response.json();
        const step2Text = step2Data.content[0].text;
        try {
          const jsonMatch = step2Text.match(/\{[\s\S]*\}/);
          step2Result = JSON.parse(jsonMatch ? jsonMatch[0] : step2Text);
        } catch (e) {
          console.error('[evaluate-style-v2] Step 2 parse error:', e);
        }
      }
    } else if (subcategories.length === 1) {
      step2Result = { subcategory: subcategories[0], confidence: 1.0, reasoning: 'Only one subcategory available' };
    }

    console.log(`[evaluate-style-v2] Step 2 result: ${step2Result.subcategory} (${step2Result.confidence})`);

    // ========================================
    // STEP 3: Classify into Specific Technique
    // ========================================
    console.log('[evaluate-style-v2] Step 3: Technique classification...');
    
    let step3Result = { medium_id: null, medium_name: null, confidence: null, reasoning: 'Skipped' };
    
    if (step2Result.subcategory) {
      // Get techniques for this subcategory
      const subcatTechniques = relevantTechniques.filter(t => t.subcategory === step2Result.subcategory);
      
      if (subcatTechniques.length > 1) {
        const step3Prompt = buildStep3Prompt(artMediumId, step2Result.subcategory, subcatTechniques);
        
        const step3Response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: { type: 'base64', media_type: mediaType, data: base64Image }
                },
                { type: 'text', text: step3Prompt }
              ]
            }]
          })
        });

        if (step3Response.ok) {
          const step3Data = await step3Response.json();
          const step3Text = step3Data.content[0].text;
          try {
            const jsonMatch = step3Text.match(/\{[\s\S]*\}/);
            step3Result = JSON.parse(jsonMatch ? jsonMatch[0] : step3Text);
          } catch (e) {
            console.error('[evaluate-style-v2] Step 3 parse error:', e);
          }
        }
      } else if (subcatTechniques.length === 1) {
        const t = subcatTechniques[0];
        step3Result = { medium_id: t.id, medium_name: t.name, confidence: 1.0, reasoning: 'Only one technique in subcategory' };
      }
    }

    console.log(`[evaluate-style-v2] Step 3 result: ${step3Result.medium_id} (${step3Result.confidence})`);

    // ========================================
    // Compile Final Result
    // ========================================
    const evaluation = {
      // Step 1 results
      art_medium_id: step1Result.art_medium_id,
      art_medium_name: artMediumName,
      confidence_art_medium: step1Result.confidence,
      reasoning_art_medium: step1Result.reasoning,
      
      // Step 2 results
      subcategory: step2Result.subcategory,
      confidence_subcategory: step2Result.confidence,
      reasoning_subcategory: step2Result.reasoning,
      
      // Step 3 results
      medium_id: step3Result.medium_id,
      medium_name: step3Result.medium_name,
      confidence_medium: step3Result.confidence,
      reasoning_medium: step3Result.reasoning,
      
      // Combined reasoning for display
      ai_reasoning: [
        `Art Medium: ${step1Result.reasoning}`,
        step2Result.subcategory ? `Subcategory: ${step2Result.reasoning}` : null,
        step3Result.medium_id ? `Technique: ${step3Result.reasoning}` : null
      ].filter(Boolean).join(' | '),
      
      // Timestamp
      evaluated_at: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        style_id,
        evaluation
      })
    };

  } catch (error) {
    console.error('[evaluate-style-v2] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
