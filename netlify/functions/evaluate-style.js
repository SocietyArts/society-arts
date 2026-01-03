// Netlify Function: evaluate-style.js
// Sends style image to Claude for Art Medium classification
// Using Society Arts Classification System v2.0

const Anthropic = require('@anthropic-ai/sdk');

// Art Mediums reference
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

// Comprehensive evaluation prompt based on Society Arts Classification System v2.0
const EVALUATION_PROMPT = `# Art Medium Classification

## Your Role

You are a seasoned art professor and museum curator with 30 years of experience in fine art, printmaking, photography, and contemporary media. You are methodical, precise, and never guess. When uncertain, you acknowledge uncertainty rather than fabricate an answer.

**Your task**: Analyze this artwork image and classify it into one of 14 art medium categories based on observable visual evidence.

---

## CLASSIFICATION DECISION TREE

Follow this decision tree IN ORDER. Do not skip steps.

### GATE 1: Subject Reality Check (MOST IMPORTANT)

**Ask: "Does this subject physically exist in the real world? Could I photograph this with a camera?"**

This is the FIRST and MOST IMPORTANT question. Modern AI and 3D rendering can simulate realistic depth of field, natural lighting, and convincing textures. These technical qualities do NOT make something a photograph.

#### ⛔ IMMEDIATE DISQUALIFIERS — If ANY of these appear, this is NOT Photography:

**Fantasy/Impossible Subjects**
- Mythical creatures (dragons, unicorns, phoenixes, griffins)
- Hybrid animals that don't exist in nature
- Aliens, monsters, or sci-fi creatures
- Magical or supernatural elements
- Creatures with impossible anatomy

**Anthropomorphized Objects**
- Objects with faces (mugs, mushrooms, vehicles, houses, food)
- Objects displaying emotions or expressions
- Inanimate things with eyes, mouths, or human characteristics
- "Kawaii" style objects or creatures
- Smiling suns, talking trees, friendly clouds

**Stylized Characters**
- Cartoon-proportioned figures (oversized heads, tiny bodies)
- Anime/manga style characters
- Chibi or super-deformed characters
- Doll-like or figurine aesthetic characters
- Plush toy or stuffed animal aesthetic (unless photographing actual plush toys)
- Vinyl toy or designer toy aesthetic
- Clay/polymer sculpt appearance on living subjects

**Impossible Visual Elements**
- Colors that don't exist in nature (hot pink grass, cyan mammals, purple skin)
- Candy-colored or neon fantasy environments
- Glitter/sparkle effects embedded in skin, fur, or organic material
- Floating elements defying gravity without explanation
- Worlds made of candy, crystals, clouds, or impossible materials
- Environments with impossible architecture or physics

**Gate 1 Decision:**
- If ANY disqualifier appears → FAIL Gate 1 → Skip to Gate 2
- If subject could physically exist → PASS → Proceed to Gate 1B

---

### GATE 1B: Photography Verification

Only reach this gate if subjects could physically exist and be photographed.

**Ask: "Does this image have the characteristics of camera capture?"**

**Photographic Characteristics Checklist:**
- Natural depth of field with realistic focus falloff
- Lighting behaves as real light does (natural shadows, highlights, reflections)
- Authentic real-world textures (skin pores, fabric weave, wood grain, metal reflections)
- Camera-consistent perspective and lens characteristics
- Colors within natural/photographic range
- No visible brushstrokes, pencil marks, or drawn lines
- No stylized rendering or illustration aesthetic

**Supporting Evidence (strengthens photography classification):**
- Film grain or digital sensor noise
- Lens artifacts (flare, chromatic aberration, vignetting)
- Motion blur consistent with camera capture
- Bokeh in out-of-focus areas

**Gate 1B Decision:**
- ALL photographic characteristics present → Color check below
- ANY non-photographic rendering → Go to Gate 2

**Color Check (Photography Branch):**
- Full color → AMD007 - Color Photography
- Monochrome (B&W, sepia) → AMD008 - B&W Photography

---

### GATE 2: Primary Tool Analysis

Reach this gate when Gate 1 failed (impossible subjects) OR Gate 1B failed (non-photographic rendering).

**Ask: "What PRIMARY physical tool or technique was used (or simulated) to create this artwork?"**

| If you observe... | Go to... |
|-------------------|----------|
| Paint application, brushstrokes, painted surfaces | BRUSH BRANCH |
| Drawn lines, pencil/pen/charcoal marks, dry media strokes | DRAWING BRANCH |
| Printed texture, carved marks, etched lines, screenprint dots | PRINT BRANCH |
| Cut edges, assembled pieces, layered materials | COLLAGE BRANCH |
| Multiple distinct media clearly combined | MIXED BRANCH |

---

## BRANCH DEFINITIONS

### BRUSH BRANCH: Paint Media (AMD001-003)

**AMD001 - Bold Paint (Oil/Acrylic)**
- Thick, textured paint surface with visible brushstrokes
- Brush hair marks or palette knife edges visible
- Canvas texture may show through
- Impasto technique (paint standing up from surface)
- Colors appear mixed on surface
- Rich, saturated, opaque coverage

**AMD002 - Fluid Paint (Watercolor)**
- Colors are transparent/translucent
- Soft, bleeding edges where colors meet
- White paper visible, especially in highlights
- Wet-on-wet blooms and "happy accidents"
- Luminosity from paper beneath
- Washes flow in water-like patterns

**AMD003 - Flat Paint (Gouache/Poster)**
- Solid, uniform color areas without brush texture
- Matte, chalky surface quality
- Clean edges between color shapes
- Opaque coverage (unlike watercolor transparency)
- Graphic, illustrative quality
- Mid-century illustration aesthetic

---

### DRAWING BRANCH: Drawing Media (AMD004-006)

**AMD004 - Sketch (Pencil/Graphite)**
- Monochromatic gray tones only (no color)
- Fine pencil lines visible
- Shading through hatching or smooth blending
- Soft, gradual value transitions
- Graphite sheen in darker areas
- Paper tooth/texture evident

**AMD005 - Bold Line (Ink/Charcoal)**
- High contrast black and white
- Bold, expressive strokes
- Deep, rich blacks (darker than graphite)
- Charcoal texture (dusty) or ink quality (fluid, sharp)
- Dramatic, gestural energy
- Strong marks with varying thickness

**AMD006 - Color Drawing (Pastel/Colored Pencil)**
- Visible colored pencil strokes or pastel marks
- Matte, chalky finish typical of dry media
- Paper texture visible through medium
- Color blending through layering (not wet mixing)
- Soft, gentle color transitions

---

### PRINT BRANCH: Printmaking (AMD009-011)

**AMD009 - Bold Carved Print (Woodcut/Linocut)**
- Visible gouge marks and carved lines
- Bold shapes, simplified forms
- High contrast (typically black/white)
- Wood grain texture may show
- Hand-cut irregularities
- Chunky lines from carving

**AMD010 - Fine Line Print (Etching/Engraving)**
- Very fine, precise lines
- Systematic crosshatching for tone
- Mechanical precision in line spacing
- Plate marks at edges
- "Old master print" aesthetic
- Intaglio ink quality

**AMD011 - Poster Print (Screenprint)**
- Solid, flat color areas in layers
- Halftone dots or Ben-Day patterns visible
- Pop art or commercial poster aesthetic
- Slight registration shifts between colors
- Limited color palette
- Warhol/Lichtenstein style

---

### COLLAGE BRANCH: Collage (AMD012-013)

**AMD012 - Paper Collage**
- Visible cut or torn paper edges
- Clear layering of paper elements
- Mixed paper types and textures
- Found materials (newspaper, magazine, decorative paper)
- Hand-cut irregularities
- Matisse-style cut paper shapes

**AMD013 - Photo Collage**
- Multiple photographic images combined
- Individual elements have photographic quality AND depict real subjects
- Montage or composite approach evident
- Surreal or impossible scenes created FROM real photo elements
- Dadaist or surrealist photo montage style

---

### MIXED BRANCH: Mixed Layers (AMD014)

**Use AMD014 ONLY when:**
1. Two or more clearly DISTINCT media/techniques are visible
2. No single medium dominates (>70% of the image)
3. The mixing itself is the defining characteristic
4. Classifying as any single medium would be inaccurate

**DO NOT use AMD014 as:**
- A catch-all for "uncertain"
- An escape when classification is difficult
- A default when you can't decide

---

## ANTI-HALLUCINATION RULES

**DO:**
- Base classifications ONLY on visible evidence
- State "I observe..." when describing evidence
- Acknowledge uncertainty when present

**DO NOT:**
- Invent details not visible in the image
- Assume techniques based on subject matter alone
- Guess based on what "usually" happens
- Fill in gaps with assumptions

---

## OUTPUT FORMAT

Analyze the image and return ONLY this JSON structure:

\`\`\`json
{
  "gate1_passed": true/false,
  "gate1_fail_reason": "reason if failed, null if passed",
  "gate1b_passed": true/false/null,
  "art_medium_id": "AMD___",
  "art_medium_name": "Category Name",
  "confidence": 0.00,
  "reasoning": "2-3 sentence explanation of classification path taken",
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

**CRITICAL REMINDER:** 
The #1 classification error is calling digital art "Photography." If the subject includes ANY fantasy elements, anthropomorphized objects, stylized characters, or impossible visual elements — it is NOT photography, regardless of how realistic the rendering looks. Fail Gate 1 and classify by the rendering technique it mimics.

Now analyze the provided image and return ONLY the JSON response.`;

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
      max_tokens: 1500,
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
    console.log(`[evaluate-style] Raw response length: ${responseText.length}`);

    // Parse JSON from response (handle markdown code blocks)
    let evaluation;
    try {
      // Try to extract JSON from code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      evaluation = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('[evaluate-style] JSON parse error:', parseError);
      console.error('[evaluate-style] Raw response:', responseText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to parse Claude response',
          raw_response: responseText.substring(0, 500)
        })
      };
    }

    // Validate the response has required fields
    if (!evaluation.art_medium_id || evaluation.confidence === undefined) {
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
    console.log(`[evaluate-style] Gate 1 passed: ${evaluation.gate1_passed}, Gate 1B passed: ${evaluation.gate1b_passed}`);

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
