// Netlify Function: evaluate-style.js
// Sends style image to Claude for Art Medium classification

const Anthropic = require('@anthropic-ai/sdk');

// Art Mediums reference (embedded for quick access)
const ART_MEDIUMS = {
  AMD001: "Bold Paint (Oil/Acrylic)",
  AMD002: "Fluid Paint (Watercolor)",
  AMD003: "Flat Paint (Poster/Gouache)",
  AMD004: "Sketch (Pencil/Graphite)",
  AMD005: "Bold Line (Ink/Charcoal)",
  AMD006: "Color Drawing (Pastel/Colored Pencil)",
  AMD007: "Color Photography",
  AMD008: "Black & White Photography",
  AMD009: "Bold Carved Print (Woodcut/Linocut)",
  AMD010: "Fine Line Print (Etching/Engraving)",
  AMD011: "Poster Print (Screenprint)",
  AMD012: "Paper Collage",
  AMD013: "Photo Collage",
  AMD014: "Mixed Layers"
};

// Comprehensive evaluation prompt
const EVALUATION_PROMPT = `You are an expert art classifier for Society Arts. Analyze this art style image and classify it into the correct Art Medium category.

## The 14 Art Medium Categories

| ID | Name | Key Indicators |
|----|------|----------------|
| AMD001 | Bold Paint (Oil/Acrylic) | Thick brushstrokes, opaque colors, canvas texture, impasto |
| AMD002 | Fluid Paint (Watercolor) | Translucent washes, soft bleeding edges, paper texture, luminosity |
| AMD003 | Flat Paint (Poster/Gouache) | Solid flat colors, matte finish, minimal texture, graphic quality |
| AMD004 | Sketch (Pencil/Graphite) | Monochromatic gray, fine lines, hatching/blending, paper texture |
| AMD005 | Bold Line (Ink/Charcoal) | High contrast blacks, bold expressive strokes, gestural energy |
| AMD006 | Color Drawing (Pastel/Colored Pencil) | Visible strokes, soft blending, matte chalky finish, paper shows |
| AMD007 | Color Photography | Photorealistic, camera depth of field, natural lighting, real textures |
| AMD008 | Black & White Photography | Photorealistic monochrome, film grain, photographic depth |
| AMD009 | Bold Carved Print (Woodcut/Linocut) | Carved gouge marks, stark contrast, hand-cut edges, wood grain |
| AMD010 | Fine Line Print (Etching/Engraving) | Fine precise lines, systematic crosshatching, mechanical precision |
| AMD011 | Poster Print (Screenprint) | Flat color layers, halftone dots, pop art aesthetic, registration |
| AMD012 | Paper Collage | Cut paper edges, layered elements, mixed papers, tactile assembly |
| AMD013 | Photo Collage | Combined photographs, montage effect, surreal combinations |
| AMD014 | Mixed Layers | Multiple distinct media combined, hybrid techniques |

## Critical Classification Rules

### Photography (AMD007) vs Digital Art
THIS IS THE MOST COMMON MISCLASSIFICATION. Be very careful.

**IS Photography if:**
- Photorealistic quality that could only come from a camera
- Natural depth of field with realistic bokeh
- Real-world textures (skin pores, fabric weave)
- Natural lighting and shadows
- Camera artifacts (lens flare, grain)

**IS NOT Photography if:**
- Fantasy/sci-fi elements that couldn't be photographed
- Stylized proportions or anatomy
- Perfect/impossible lighting
- Visible digital painting strokes
- Unnaturally saturated colors
- 3D rendered appearance

### When Uncertain About Digital Art
If the image is clearly digital but mimics a traditional medium:
- Mimics watercolor → AMD002
- Mimics oil painting → AMD001
- Mimics pencil sketch → AMD004
- Multiple techniques → AMD014

## Your Task

Analyze the image and return a JSON classification:

\`\`\`json
{
  "art_medium_id": "AMD___",
  "art_medium_name": "Name of the category",
  "confidence": 0.00,
  "reasoning": "2-3 sentence explanation of why this classification is correct",
  "visual_evidence": ["evidence 1", "evidence 2", "evidence 3"],
  "ruled_out": [
    {"category": "AMD___ - Name", "reason": "Why not this"}
  ]
}
\`\`\`

**Confidence Scale:**
- 0.95-1.00: Textbook example, absolutely certain
- 0.85-0.94: Very confident, clear indicators
- 0.70-0.84: Confident, most indicators present
- 0.50-0.69: Uncertain, mixed signals
- Below 0.50: Cannot reliably classify

Now analyze the provided image and return ONLY the JSON response, no additional text.`;

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { style_id, image_url } = JSON.parse(event.body);

    if (!style_id || !image_url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing style_id or image_url' })
      };
    }

    console.log(`[evaluate-style] Evaluating style: ${style_id}`);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Fetch the image and convert to base64
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Determine media type from URL
    let mediaType = 'image/webp';
    if (image_url.includes('.jpg') || image_url.includes('.jpeg')) {
      mediaType = 'image/jpeg';
    } else if (image_url.includes('.png')) {
      mediaType = 'image/png';
    }

    // Call Claude API with vision
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: EVALUATION_PROMPT
            }
          ]
        }
      ]
    });

    // Extract the response text
    const responseText = response.content[0].text;
    console.log(`[evaluate-style] Raw response: ${responseText}`);

    // Parse JSON from response (handle markdown code blocks)
    let evaluation;
    try {
      // Try to extract JSON from code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      evaluation = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('[evaluate-style] JSON parse error:', parseError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to parse Claude response',
          raw_response: responseText
        })
      };
    }

    // Validate the response has required fields
    if (!evaluation.art_medium_id || !evaluation.confidence) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid evaluation response structure',
          evaluation
        })
      };
    }

    // Add the full name if not present
    if (!evaluation.art_medium_name && ART_MEDIUMS[evaluation.art_medium_id]) {
      evaluation.art_medium_name = ART_MEDIUMS[evaluation.art_medium_id];
    }

    console.log(`[evaluate-style] Classification: ${evaluation.art_medium_id} (${evaluation.confidence})`);

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
    console.error('[evaluate-style] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error'
      })
    };
  }
};
