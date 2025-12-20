# Society Arts Medium Matrix

## Overview

The Medium Matrix is the classification system for organizing 5,000+ artistic styles into manageable categories. It consists of 5 main categories containing 14 medium types.

## Structure

```
5 Categories → 14 Mediums → ~5,000 Styles
```

## Categories & Mediums

### 1. PAINTING (3 mediums)

| Medium | Code | Description |
|--------|------|-------------|
| Bold Paint (Oil/Acrylic) | PAINT-BOLD | Thick, textured brushwork with visible strokes. Rich, opaque colors. Impasto techniques. |
| Fluid Paint (Watercolor) | PAINT-FLUID | Transparent washes, soft edges, color bleeding. Delicate and luminous. |
| Flat Paint (Poster/Gouache) | PAINT-FLAT | Solid color blocks, minimal texture. Clean graphic look. Matte finish. |

### 2. DRAWING (3 mediums)

| Medium | Code | Description |
|--------|------|-------------|
| Sketch (Pencil/Graphite) | DRAW-SKETCH | Tonal shading, fine lines, realistic or loose sketching. Grayscale focused. |
| Bold Line (Ink/Charcoal) | DRAW-BOLD | Strong contrast, expressive marks. Deep blacks, dramatic shadows. |
| Color Drawing (Pastel/Colored Pencil) | DRAW-COLOR | Soft blending or precise layering. Rich pigments on paper texture. |

### 3. PHOTOGRAPHY (2 mediums)

| Medium | Code | Description |
|--------|------|-------------|
| Color Photography | PHOTO-COLOR | Full color photographic styles. Various treatments and moods. |
| Black & White Photography | PHOTO-BW | Monochromatic. Focus on contrast, light, shadow, and composition. |

### 4. PRINTMAKING (3 mediums)

| Medium | Code | Description |
|--------|------|-------------|
| Bold Carved Print (Woodcut/Linocut) | PRINT-CARVED | High contrast, bold shapes. Hand-carved aesthetic with wood grain texture. |
| Fine Line Print (Etching/Engraving) | PRINT-FINE | Intricate crosshatching, detailed line work. Classic illustration feel. |
| Poster Print (Screenprint) | PRINT-POSTER | Limited color palette, graphic shapes. Pop art and commercial print aesthetic. |

### 5. COLLAGE / MIXED MEDIA (3 mediums)

| Medium | Code | Description |
|--------|------|-------------|
| Paper Collage | COLLAGE-PAPER | Cut paper shapes, torn edges. Layered compositions with visible seams. |
| Photo Collage | COLLAGE-PHOTO | Combined photographs, montage effects. Surreal or documentary style. |
| Mixed Layers | COLLAGE-MIXED | Multiple media combined. Paint over photo, digital over traditional, etc. |

## Style Data Structure

Each style in the database follows this structure:

```javascript
{
  id: '10100001',                    // 8-digit unique ID
  name: 'Bold Post Impressionist',    // Short name
  displayName: 'Painting Bold Post Impressionist Vibrant',  // Full display name
  categoryId: 'painting',             // Parent category
  mediumId: 'paint-bold',             // Parent medium
  description: 'Description text...',  // 2-3 sentences
  tags: ['Oil Paint', 'Impasto', ...], // 5 searchable tags
  aboutText: 'About this style...',   // Explanation for users
  palette: ['#E74C3C', '#F39C12', ...], // 5 hex colors
  thumbnail: 'https://...',           // Main preview image
  images: [                           // 9 sample images (future)
    'https://...image1.jpg',
    'https://...image2.jpg',
    // ... 9 total
  ]
}
```

## Style ID Format

8-digit format: `CCMMNNNN`

- CC = Category (10-50)
  - 10 = Painting
  - 20 = Drawing
  - 30 = Photography
  - 40 = Printmaking
  - 50 = Collage
  
- MM = Medium (01-03)
  - 01 = First medium in category
  - 02 = Second medium
  - 03 = Third medium
  
- NNNN = Style number (0001-9999)

Example: `10100001` = Painting > Bold Paint > Style #0001

## Classifying Your 5,000 Styles

### Approach 1: Spreadsheet Template

1. Create spreadsheet with columns:
   - style_name
   - category (painting/drawing/photography/printmaking/collage)
   - medium (select from 14 options)
   - description
   - tags (comma-separated)
   - palette (5 hex colors)
   - thumbnail_url

2. Fill in for each style
3. Export as JSON
4. Import into style-data.js

### Approach 2: AI-Assisted Classification

Use Claude to suggest classifications based on style name/description:

```
Given this art style name: "[STYLE NAME]"
And description: "[DESCRIPTION]"

Classify into one of these 14 mediums:
- paint-bold (Oil/Acrylic with thick brushwork)
- paint-fluid (Watercolor, transparent washes)
- paint-flat (Gouache, poster paint, flat colors)
- draw-sketch (Pencil, graphite, grayscale)
- draw-bold (Ink, charcoal, high contrast)
- draw-color (Pastel, colored pencil)
- photo-color (Color photography)
- photo-bw (Black & white photography)
- print-carved (Woodcut, linocut)
- print-fine (Etching, engraving)
- print-poster (Screenprint, pop art)
- collage-paper (Paper collage)
- collage-photo (Photo montage)
- collage-mixed (Mixed media)

Respond with just the medium ID.
```

### Approach 3: Batch Import

1. Organize styles into 14 folders by medium
2. Run script to generate IDs and create JSON
3. Import into database

## Distribution Guidelines

Suggested style distribution across 5,000 styles:

| Category | Mediums | Suggested Count | % |
|----------|---------|-----------------|---|
| Painting | 3 | 1,500 | 30% |
| Drawing | 3 | 1,000 | 20% |
| Photography | 2 | 1,000 | 20% |
| Printmaking | 3 | 750 | 15% |
| Collage | 3 | 750 | 15% |
| **Total** | **14** | **5,000** | **100%** |

Within each category, distribute roughly equally among mediums.

## Image Requirements

For each style, prepare:

1. **Compilation thumbnail** (400x400px) - Grid of 9 small samples
2. **9 individual samples** (800x800px each) showing:
   - Portrait
   - Landscape
   - Animal/Pet
   - Still Life
   - Architecture
   - Abstract
   - Nature
   - Action/Movement
   - Mood/Atmosphere

## Adding New Styles

To add styles to the current sample data:

1. Edit `js/style-finder/style-data.js`
2. Add to `SAMPLE_STYLES` array
3. Follow the data structure above
4. Ensure unique ID
5. Test in browser

## Future Enhancements

- [ ] Full database of 5,000 styles
- [ ] Cloudinary integration for images
- [ ] Style similarity recommendations
- [ ] AI-powered style suggestions based on story
- [ ] User-uploaded custom styles
- [ ] Style mixing/blending
