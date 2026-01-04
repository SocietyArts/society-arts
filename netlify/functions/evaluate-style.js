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

## CRITICAL RULES

### 1. DO NOT DISCUSS SUBJECT MATTER
- NEVER mention what is depicted (people, landscapes, animals, objects)
- NEVER describe the scene or narrative
- ONLY discuss: technique, texture, color treatment, medium characteristics, surface quality
- These styles are TEMPLATES - users will apply their own subjects

### 2. MULTI-IMAGE EVALUATION
- You are seeing MULTIPLE EXAMPLE IMAGES from the same art style
- Look for CONSISTENT TECHNICAL ELEMENTS across all images
- The style is defined by HOW things are rendered, not WHAT is rendered
- Identify the shared visual treatment/technique

## THE CORE QUESTION

**"If you walked into an art supply store to recreate this exact LOOK and FEEL by hand, what aisle would you go to?"**

Every image was created digitally - that's NOT useful information. What IS useful is the VISUAL LINEAGE - which traditional art technique does this emulate?

## FOCUS ON THESE TECHNICAL ELEMENTS

✅ DISCUSS:
- Color palette and saturation (muted, vibrant, limited)
- Surface texture (brushstrokes, grain, smooth, chalky)
- Edge quality (sharp, soft, bleeding, crisp)
- Value contrast (high contrast, subtle gradation)
- Line quality (if present - bold, delicate, sketchy)
- Film/print characteristics (grain, color shifts, vignetting)
- Traditional medium signatures (wet-on-wet blooms, impasto, halftone dots)

❌ DO NOT DISCUSS:
- What is depicted (subjects, scenes, people, objects)
- Narrative or story
- Mood or emotion (unless directly tied to technique)
- Composition (unless discussing technical medium constraints)

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
Use when you'd grab: A camera and film/sensor
Visual signatures:
- Photorealistic rendering with camera-like qualities
- Natural depth of field and focus falloff
- Film grain or digital sensor characteristics
- Authentic lighting and exposure qualities
- Full color with natural or stylized color grading
- Vintage film stock looks (Kodachrome warmth, Ektachrome saturation, etc.)

**AMD008 - Black & White Photography**
Same as above but monochromatic
Visual signatures:
- All the photographic qualities of AMD007
- But in grayscale, sepia, or monochrome
- Classic film photography aesthetic
- Tonal range and contrast characteristic of B&W film

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

2. **Consistent Technical Elements**: What visual treatment is consistent across all sample images?
   - Same color palette/saturation?
   - Same texture/surface quality?
   - Same edge treatment?
   - Same rendering style?

3. **Material Identification**: What marks, textures, or surface qualities do you see?
   - Brushstrokes, paint texture → Paint media
   - Pencil/chalk marks, hatching → Drawing media
   - Carved marks, halftone dots → Printmaking
   - Cut edges, layered elements → Collage
   - Film grain, natural DOF, lens qualities → Photography

4. **Photography Note**: If it looks photographic, consider:
   - Does it have film/camera characteristics (grain, color shifts, DOF)?
   - Is the rendering photorealistic with no visible artistic marks?
   - Even stylized or fantastical subjects can be "photographic" if they're rendered with camera-like qualities

5. **Refine Within Category**: Match to specific medium based on detailed characteristics

---

## OUTPUT FORMAT

Return ONLY this JSON:

\`\`\`json
{
  "art_medium_id": "AMD___",
  "art_medium_name": "Category Name",
  "confidence": 0.00,
  "traditional_equivalent": "What you'd buy at the art store",
  "reasoning": "2-3 sentences about the TECHNICAL QUALITIES that indicate this medium (no subject matter)",
  "visual_evidence": ["technical element 1", "technical element 2", "technical element 3"]
}
\`\`\`

**Visual Evidence Examples (GOOD):**
- "Visible brushstroke texture with impasto effects"
- "Warm color shift and film grain typical of Ektachrome"
- "Soft bleeding edges where colors meet"
- "Flat opaque color areas with clean graphic edges"
- "Fine crosshatching for tonal values"

**Visual Evidence Examples (BAD - do not use):**
- "Mountain landscape with trees" ❌
- "Portrait of a person" ❌
- "Realistic representation of a lion" ❌

**Confidence Scale:**
- 0.90-1.00: Classic example of this medium's look
- 0.75-0.89: Strong match with clear indicators
- 0.60-0.74: Good match, some ambiguity
- Below 0.60: Uncertain, mixed signals

---

## EXAMPLES OF CORRECT REASONING

**Style with soft color washes and white showing through:**
- Reasoning: "Transparent color application with soft bleeding edges and luminous quality from white ground showing through. Consistent wet-on-wet technique across all samples."
- Classification: AMD002 (Fluid Paint/Watercolor)

**Style with vintage color shifts and film grain:**
- Reasoning: "Warm color cast with subtle grain texture and natural depth of field. Color saturation and tonal range consistent with vintage slide film stock."
- Classification: AMD007 (Color Photography)

**Style with flat opaque colors and clean edges:**
- Reasoning: "Solid color areas with no visible brushwork and crisp graphic edges. Matte, chalky surface quality typical of gouache illustration."
- Classification: AMD003 (Flat Paint/Gouache)

---

Now analyze the provided images. Focus ONLY on consistent technical/medium qualities across all samples.

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

    // Extract base URL to fetch multiple images
    // image_url format: https://.../{style_id}/{style_id}-01.webp
    const baseUrl = image_url.replace(/-\d+\.webp$/, '');
    
    // Fetch 4 sample images (-01 through -04)
    const imageNumbers = ['01', '02', '03', '04'];
    const imageContents = [];
    
    for (const num of imageNumbers) {
      const url = `${baseUrl}-${num}.webp`;
      try {
        const imageResponse = await fetch(url);
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          imageContents.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/webp',
              data: base64Image
            }
          });
          console.log(`[evaluate-style] Loaded image ${num}`);
        } else {
          console.log(`[evaluate-style] Image ${num} not found, skipping`);
        }
      } catch (imgErr) {
        console.log(`[evaluate-style] Failed to load image ${num}: ${imgErr.message}`);
      }
    }
    
    // Need at least 1 image to evaluate
    if (imageContents.length === 0) {
      throw new Error('No images could be loaded for evaluation');
    }
    
    console.log(`[evaluate-style] Evaluating with ${imageContents.length} images`);

    // Build content array with all images + prompt
    const messageContent = [
      ...imageContents,
      {
        type: 'text',
        text: EVALUATION_PROMPT
      }
    ];

    // Call Claude API with vision (multiple images)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: messageContent
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
