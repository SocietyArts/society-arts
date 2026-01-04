// Netlify Function: evaluate-style.js
// Sends style image to Claude for Art Medium classification
// Philosophy: "What traditional medium does this EMULATE?"

const Anthropic = require('@anthropic-ai/sdk');

// Art Mediums reference - Traditional media categories
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

// Classification prompt - Traditional Medium Emulation Philosophy
const EVALUATION_PROMPT = `# Art Medium Classification: Traditional Emulation

## Your Role

You are a seasoned art professor helping students understand visual aesthetics. Your expertise is in recognizing which TRADITIONAL art medium a digital artwork is emulating.

## IMPORTANT CONTEXT

You are looking at a SINGLE EXAMPLE IMAGE from an art style collection. This image represents the overall aesthetic of the style. Do NOT describe this as a "collage" or "grid" - you are evaluating the artistic medium/technique shown in this ONE image.

## THE CORE QUESTION

**"If you walked into an art supply store to recreate this exact look BY HAND, what aisle would you go to?"**

Every image in this collection was created digitally - that's a given and NOT useful information. What IS useful is understanding the VISUAL LINEAGE - which traditional art technique does this artwork honor, emulate, or reference?

## IMPORTANT MINDSET

- Do NOT think about how it was actually made (digitally)
- DO think about what it LOOKS LIKE it was made with
- Ask: "What traditional materials would produce this visual effect?"
- Ask: "What section of the art museum would this fit in?"

---

## CLASSIFICATION CATEGORIES

### PAINT MEDIA (Brush-based)

**AMD001 - Bold Paint (Oil/Acrylic)**
Use when you'd grab: Oil paints, acrylics, canvas, palette knives
Visual signatures:
- Visible brushstroke texture (thick, confident marks)
- Rich, saturated, opaque color
- Paint appears to have BODY - you can almost feel the thickness
- Impasto effects (paint standing up from surface)
- Colors mixed on the canvas
- Classic "painting" look from museums

**AMD002 - Fluid Paint (Watercolor)**
Use when you'd grab: Watercolors, watercolor paper, soft brushes
Visual signatures:
- Transparent, luminous colors
- Soft, bleeding edges where colors meet
- White of paper showing through (especially highlights)
- Wet-on-wet blooms and organic flow
- Delicate, ethereal quality
- Washes that flow like water

**AMD003 - Flat Paint (Gouache/Poster)**
Use when you'd grab: Gouache, poster paints, illustration board
Visual signatures:
- Solid, flat areas of color (no visible brushstrokes)
- Matte, chalky, velvety surface quality
- Clean, graphic edges between colors
- Mid-century illustration aesthetic
- Opaque but smooth (unlike textured oil paint)
- Children's book or vintage poster look

---

### DRAWING MEDIA (Dry, hand-held tools)

**AMD004 - Sketch (Pencil/Graphite)**
Use when you'd grab: Pencils, graphite sticks, drawing paper
Visual signatures:
- Monochromatic grays only (no color)
- Fine pencil lines and hatching visible
- Soft, gradual value transitions
- Graphite sheen in dark areas
- Paper texture showing through
- Sketchbook or study aesthetic

**AMD005 - Bold Line (Ink/Charcoal)**
Use when you'd grab: India ink, charcoal sticks, brushes, nibs
Visual signatures:
- High contrast black and white
- Bold, expressive, gestural strokes
- Deep, velvety blacks (richer than pencil)
- Dramatic, energetic marks
- Varying line thickness with confidence
- Woodcut or expressionist energy

**AMD006 - Color Drawing (Pastel/Colored Pencil)**
Use when you'd grab: Pastels, colored pencils, toned paper
Visual signatures:
- Visible colored pencil strokes or chalky pastel marks
- Matte, powdery finish
- Paper texture visible through the medium
- Colors blended by layering (not wet mixing)
- Soft, gentle aesthetic
- Portrait or landscape study feel

---

### PHOTOGRAPHY

**AMD007 - Color Photography**
Use when you'd grab: A camera
Visual signatures:
- Photorealistic representation of REAL subjects
- Natural depth of field and focus
- Authentic textures (skin pores, fabric, surfaces)
- Camera-consistent lighting and perspective
- Full color, natural color range
- CRITICAL: Subject must be something that could physically exist and be photographed

**AMD008 - Black & White Photography**
Same as above but monochromatic
Visual signatures:
- All the photographic qualities of AMD007
- But in grayscale, sepia, or monochrome
- Classic film photography aesthetic

**⚠️ PHOTOGRAPHY EXCLUSIONS:**
These can NEVER be photography, regardless of how realistic they look:
- Fantasy creatures (dragons, unicorns, mythical beings)
- Anthropomorphized objects (smiling food, objects with faces)
- Stylized characters (anime, cartoon proportions, doll-like figures)
- Impossible elements (pink grass, floating objects, candy worlds)
- If the SUBJECT couldn't exist in reality, it's NOT photography

---

### PRINTMAKING

**AMD009 - Bold Carved Print (Woodcut/Linocut)**
Use when you'd grab: Woodblocks, linoleum, carving tools, ink, press
Visual signatures:
- Bold shapes, simplified forms
- Visible gouge marks and carved lines
- High contrast (typically black and white)
- Hand-cut irregularities give it warmth
- Chunky, confident lines
- Folk art or expressionist aesthetic

**AMD010 - Fine Line Print (Etching/Engraving)**
Use when you'd grab: Metal plates, etching needles, acid, press
Visual signatures:
- Very fine, precise lines
- Systematic crosshatching for tonal values
- Mechanical precision in line spacing
- "Old master print" aesthetic
- Currency or classical illustration look
- Meticulous detail work

**AMD011 - Poster Print (Screenprint/Silkscreen)**
Use when you'd grab: Screens, squeegees, poster ink
Visual signatures:
- Solid, flat color areas in layers
- Halftone dots or Ben-Day patterns may be visible
- Pop art or commercial poster aesthetic
- Limited color palette (spot colors)
- Warhol, Lichtenstein, concert poster energy
- Slight registration shifts between colors

---

### COLLAGE

**AMD012 - Paper Collage**
Use when you'd grab: Scissors, glue, found papers, magazines
Visual signatures:
- Visible cut or torn paper edges
- Layered paper elements
- Mixed paper types and textures
- Hand-assembled aesthetic
- Matisse cut-outs or mixed-media artist vibe

**AMD013 - Photo Collage**
Use when you'd grab: Printed photographs, scissors, glue
Visual signatures:
- Multiple photographic images combined
- Montage or composite approach
- Surreal scenes made FROM real photo elements
- Dadaist or album cover aesthetic

---

### MIXED MEDIA

**AMD014 - Mixed Layers**
Use when you'd grab: Multiple materials from different aisles
Use ONLY when:
- Two or more clearly DISTINCT traditional media are combined
- No single medium dominates (each is >30% of the image)
- The mixing itself is the defining characteristic
- Examples: Photo with painted elements, drawing over collage

**DO NOT use as a catch-all for "I'm not sure"**

---

## DECISION PROCESS

1. **First Impression**: What art supply store aisle does this remind you of?

2. **Reality Check (for Photography only)**: Could this subject physically exist?
   - If NO → It's not photography, even if photorealistic
   - If YES → Continue evaluating photographic qualities

3. **Material Identification**: What marks, textures, or surface qualities do you see?
   - Brushstrokes → Paint media
   - Pencil/chalk marks → Drawing media
   - Carved/printed marks → Printmaking
   - Cut edges, layers → Collage
   - Camera capture qualities → Photography

4. **Refine Within Category**: Match to specific medium based on detailed characteristics

---

## OUTPUT FORMAT

Return ONLY this JSON:

\`\`\`json
{
  "art_medium_id": "AMD___",
  "art_medium_name": "Category Name",
  "confidence": 0.00,
  "traditional_equivalent": "What you'd buy at the art store",
  "reasoning": "2-3 sentences explaining why this looks like [medium]",
  "visual_evidence": ["evidence 1", "evidence 2", "evidence 3"]
}
\`\`\`

**Confidence Scale:**
- 0.90-1.00: Classic example of this medium's look
- 0.75-0.89: Strong match with clear indicators
- 0.60-0.74: Good match, some ambiguity
- Below 0.60: Uncertain, mixed signals

---

## EXAMPLES OF CORRECT THINKING

**Anime character with soft shading:**
- Looks like: Marker illustration or gouache
- NOT: Photography (even if detailed) - subject is stylized
- Classification: AMD003 (Flat Paint) or AMD006 (Color Drawing)

**Hyperrealistic dragon:**
- Looks like: Oil painting or digital (but we don't say digital)
- NOT: Photography - dragons don't exist
- Classification: AMD001 (Bold Paint) - it emulates realistic painting technique

**Portrait of real person with brushstroke texture:**
- Looks like: Oil painting
- Classification: AMD001 (Bold Paint)

**Portrait of real person, photorealistic, no visible brush marks:**
- Subject could exist: YES
- Looks like: Camera captured it
- Classification: AMD007 (Color Photography)

**Whimsical town with flat colors and clean edges:**
- Looks like: Gouache illustration or screen print
- Classification: AMD003 (Flat Paint) or AMD011 (Poster Print)

---

Now analyze the provided image. Think: "What traditional art materials would create this exact look?"

Return ONLY the JSON response.`;

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
      max_tokens: 1000,
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
