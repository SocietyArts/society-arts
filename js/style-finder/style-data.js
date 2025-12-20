/* ========================================
   SOCIETY ARTS - STYLE DATA
   Medium Matrix and Style Database
   Version: 2.0
   ======================================== */

// ========================================
// MEDIUM MATRIX - 5 Categories, 14 Mediums
// ========================================

const MEDIUM_MATRIX = {
  categories: [
    {
      id: 'painting',
      name: 'Painting',
      icon: 'palette',
      mediums: [
        {
          id: 'paint-bold',
          name: 'Bold Paint (Oil/Acrylic)',
          shortCode: 'PAINT-BOLD',
          description: 'Thick, textured brushwork with visible strokes. Rich, opaque colors. Impasto techniques.',
          keywords: ['oil', 'acrylic', 'impasto', 'textured', 'brushstrokes', 'thick paint']
        },
        {
          id: 'paint-fluid',
          name: 'Fluid Paint (Watercolor)',
          shortCode: 'PAINT-FLUID',
          description: 'Transparent washes, soft edges, color bleeding. Delicate and luminous.',
          keywords: ['watercolor', 'wash', 'transparent', 'soft', 'fluid', 'luminous']
        },
        {
          id: 'paint-flat',
          name: 'Flat Paint (Poster/Gouache)',
          shortCode: 'PAINT-FLAT',
          description: 'Solid color blocks, minimal texture. Clean graphic look. Matte finish.',
          keywords: ['gouache', 'poster', 'flat', 'graphic', 'matte', 'solid color']
        }
      ]
    },
    {
      id: 'drawing',
      name: 'Drawing',
      icon: 'pencil',
      mediums: [
        {
          id: 'draw-sketch',
          name: 'Sketch (Pencil/Graphite)',
          shortCode: 'DRAW-SKETCH',
          description: 'Tonal shading, fine lines, realistic or loose sketching. Grayscale focused.',
          keywords: ['pencil', 'graphite', 'sketch', 'shading', 'grayscale', 'tonal']
        },
        {
          id: 'draw-bold',
          name: 'Bold Line (Ink/Charcoal)',
          shortCode: 'DRAW-BOLD',
          description: 'Strong contrast, expressive marks. Deep blacks, dramatic shadows.',
          keywords: ['ink', 'charcoal', 'bold', 'contrast', 'expressive', 'dramatic']
        },
        {
          id: 'draw-color',
          name: 'Color Drawing (Pastel/Colored Pencil)',
          shortCode: 'DRAW-COLOR',
          description: 'Soft blending or precise layering. Rich pigments on paper texture.',
          keywords: ['pastel', 'colored pencil', 'blending', 'pigment', 'layered']
        }
      ]
    },
    {
      id: 'photography',
      name: 'Photography',
      icon: 'camera',
      mediums: [
        {
          id: 'photo-color',
          name: 'Color Photography',
          shortCode: 'PHOTO-COLOR',
          description: 'Full color photographic styles. Various treatments and moods.',
          keywords: ['photo', 'color', 'realistic', 'cinematic', 'vibrant']
        },
        {
          id: 'photo-bw',
          name: 'Black & White Photography',
          shortCode: 'PHOTO-BW',
          description: 'Monochromatic. Focus on contrast, light, shadow, and composition.',
          keywords: ['black and white', 'monochrome', 'contrast', 'noir', 'classic']
        }
      ]
    },
    {
      id: 'printmaking',
      name: 'Printmaking',
      icon: 'layers',
      mediums: [
        {
          id: 'print-carved',
          name: 'Bold Carved Print (Woodcut/Linocut)',
          shortCode: 'PRINT-CARVED',
          description: 'High contrast, bold shapes. Hand-carved aesthetic with wood grain texture.',
          keywords: ['woodcut', 'linocut', 'carved', 'bold', 'high contrast', 'relief']
        },
        {
          id: 'print-fine',
          name: 'Fine Line Print (Etching/Engraving)',
          shortCode: 'PRINT-FINE',
          description: 'Intricate crosshatching, detailed line work. Classic illustration feel.',
          keywords: ['etching', 'engraving', 'crosshatch', 'fine line', 'detailed', 'classic']
        },
        {
          id: 'print-poster',
          name: 'Poster Print (Screenprint)',
          shortCode: 'PRINT-POSTER',
          description: 'Limited color palette, graphic shapes. Pop art and commercial print aesthetic.',
          keywords: ['screenprint', 'silkscreen', 'poster', 'pop art', 'graphic', 'limited color']
        }
      ]
    },
    {
      id: 'collage',
      name: 'Collage / Mixed Media',
      icon: 'scissors',
      mediums: [
        {
          id: 'collage-paper',
          name: 'Paper Collage',
          shortCode: 'COLLAGE-PAPER',
          description: 'Cut paper shapes, torn edges. Layered compositions with visible seams.',
          keywords: ['paper', 'cut', 'torn', 'layered', 'shapes', 'textured']
        },
        {
          id: 'collage-photo',
          name: 'Photo Collage',
          shortCode: 'COLLAGE-PHOTO',
          description: 'Combined photographs, montage effects. Surreal or documentary style.',
          keywords: ['photo montage', 'surreal', 'combined', 'documentary', 'composite']
        },
        {
          id: 'collage-mixed',
          name: 'Mixed Layers',
          shortCode: 'COLLAGE-MIXED',
          description: 'Multiple media combined. Paint over photo, digital over traditional, etc.',
          keywords: ['mixed media', 'combined', 'multimedia', 'hybrid', 'experimental']
        }
      ]
    }
  ]
};

// ========================================
// SAMPLE STYLES (5 per medium = 70 total)
// ========================================

const SAMPLE_STYLES = [
  // PAINTING - Bold Paint (Oil/Acrylic)
  {
    id: '10100001',
    name: 'Bold Post Impressionist Vibrant',
    displayName: 'Painting Bold Post Impressionist Vibrant',
    categoryId: 'painting',
    mediumId: 'paint-bold',
    description: 'Bold post-impressionist painting style with vibrant colors and expressive brushstrokes. Thick impasto texture creates dynamic visual impact. Perfect for wall art enthusiasts who love colorful expressive artwork.',
    tags: ['Oil Paint', 'Impasto', 'Palette Knife', 'Linen Canvas', 'Matte / Low Gloss'],
    aboutText: 'Helps you understand the mood, materials, and artistic feel behind each piece—so you can choose the look that best fits your story and space.',
    palette: ['#E74C3C', '#F39C12', '#3498DB', '#27AE60', '#8E44AD'],
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop'
  },
  {
    id: '10100002',
    name: 'Moody Expressionist Dark',
    displayName: 'Painting Moody Expressionist Dark',
    categoryId: 'painting',
    mediumId: 'paint-bold',
    description: 'Dark, moody expressionist style with bold brushwork and emotional depth. Deep shadows and dramatic lighting create atmosphere.',
    tags: ['Oil Paint', 'Expressionist', 'Dark Tones', 'Canvas', 'Matte'],
    aboutText: 'Perfect for creating emotionally charged artwork with depth and mystery.',
    palette: ['#2C3E50', '#1A252F', '#7F8C8D', '#95A5A6', '#34495E'],
    thumbnail: 'https://images.unsplash.com/photo-1549289524-06cf8837ace5?w=400&h=400&fit=crop'
  },
  {
    id: '10100003',
    name: 'Sunny Plein Air Landscape',
    displayName: 'Painting Sunny Plein Air Landscape',
    categoryId: 'painting',
    mediumId: 'paint-bold',
    description: 'Bright, sun-drenched plein air style capturing outdoor scenes with loose, confident brushwork and natural light.',
    tags: ['Oil Paint', 'Plein Air', 'Landscape', 'Natural Light', 'Canvas'],
    aboutText: 'Ideal for landscapes and outdoor scenes with warm, inviting atmosphere.',
    palette: ['#F1C40F', '#2ECC71', '#3498DB', '#E67E22', '#ECF0F1'],
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop'
  },
  {
    id: '10100004',
    name: 'Rich Textured Floral',
    displayName: 'Painting Rich Textured Floral',
    categoryId: 'painting',
    mediumId: 'paint-bold',
    description: 'Luxurious floral paintings with thick, textured paint application. Rich colors and dimensional brushwork bring flowers to life.',
    tags: ['Oil Paint', 'Floral', 'Impasto', 'Textured', 'Gallery Quality'],
    aboutText: 'Beautiful for botanical subjects and nature-inspired artwork.',
    palette: ['#E91E63', '#9C27B0', '#4CAF50', '#FF9800', '#FFEB3B'],
    thumbnail: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=400&fit=crop'
  },
  {
    id: '10100005',
    name: 'Contemporary Abstract Bold',
    displayName: 'Painting Contemporary Abstract Bold',
    categoryId: 'painting',
    mediumId: 'paint-bold',
    description: 'Modern abstract style with bold color blocking and dynamic compositions. Perfect for contemporary interiors.',
    tags: ['Acrylic', 'Abstract', 'Contemporary', 'Bold Colors', 'Large Scale'],
    aboutText: 'Great for abstract interpretations and modern art lovers.',
    palette: ['#FF5722', '#00BCD4', '#FFEB3B', '#E91E63', '#3F51B5'],
    thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop'
  },

  // PAINTING - Fluid Paint (Watercolor)
  {
    id: '10200001',
    name: 'Soft Botanical Watercolor',
    displayName: 'Painting Soft Botanical Watercolor',
    categoryId: 'painting',
    mediumId: 'paint-fluid',
    description: 'Delicate botanical watercolors with soft washes and natural color bleeding. Ethereal and organic feel.',
    tags: ['Watercolor', 'Botanical', 'Soft Wash', 'Paper', 'Translucent'],
    aboutText: 'Perfect for nature studies and delicate botanical subjects.',
    palette: ['#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5', '#FF8B94'],
    thumbnail: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop'
  },
  {
    id: '10200002',
    name: 'Loose Impressionist Wash',
    displayName: 'Painting Loose Impressionist Wash',
    categoryId: 'painting',
    mediumId: 'paint-fluid',
    description: 'Flowing watercolor style with loose, impressionist sensibility. Beautiful color mixing and soft edges.',
    tags: ['Watercolor', 'Impressionist', 'Loose Style', 'Wet-on-Wet', 'Luminous'],
    aboutText: 'Ideal for landscapes and scenes with atmospheric quality.',
    palette: ['#74B9FF', '#A29BFE', '#FD79A8', '#FFEAA7', '#81ECEC'],
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop'
  },
  {
    id: '10200003',
    name: 'Ethereal Portrait Wash',
    displayName: 'Painting Ethereal Portrait Wash',
    categoryId: 'painting',
    mediumId: 'paint-fluid',
    description: 'Soft, dreamy portrait style with delicate watercolor washes. Captures emotion through subtle color.',
    tags: ['Watercolor', 'Portrait', 'Ethereal', 'Soft Focus', 'Emotional'],
    aboutText: 'Beautiful for portraiture with a gentle, emotional quality.',
    palette: ['#FAD0C4', '#FFD1FF', '#E8D5B7', '#B5EAD7', '#C7CEEA'],
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  },
  {
    id: '10200004',
    name: 'Vibrant Wet-on-Wet',
    displayName: 'Painting Vibrant Wet-on-Wet',
    categoryId: 'painting',
    mediumId: 'paint-fluid',
    description: 'Bold, vibrant watercolors with exciting color interactions. Wet-on-wet technique creates beautiful blooms.',
    tags: ['Watercolor', 'Vibrant', 'Wet-on-Wet', 'Color Bloom', 'Expressive'],
    aboutText: 'Perfect for creating dynamic, colorful abstract pieces.',
    palette: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'],
    thumbnail: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=400&h=400&fit=crop'
  },
  {
    id: '10200005',
    name: 'Serene Asian Brush',
    displayName: 'Painting Serene Asian Brush',
    categoryId: 'painting',
    mediumId: 'paint-fluid',
    description: 'Zen-inspired watercolor with Asian brush painting influence. Minimalist, contemplative style.',
    tags: ['Watercolor', 'Asian Brush', 'Minimalist', 'Zen', 'Contemplative'],
    aboutText: 'Ideal for serene landscapes and nature studies.',
    palette: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9', '#FFEAA7'],
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
  },

  // PAINTING - Flat Paint (Poster/Gouache)
  {
    id: '10300001',
    name: 'Vintage Travel Poster',
    displayName: 'Painting Vintage Travel Poster',
    categoryId: 'painting',
    mediumId: 'paint-flat',
    description: 'Classic travel poster style with flat color blocks and bold graphic design. Nostalgic and eye-catching.',
    tags: ['Gouache', 'Vintage', 'Travel Poster', 'Graphic', 'Retro'],
    aboutText: 'Perfect for location-based art and nostalgic scenes.',
    palette: ['#E74C3C', '#2980B9', '#F39C12', '#27AE60', '#ECF0F1'],
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
  },
  {
    id: '10300002',
    name: 'Mid-Century Modern Flat',
    displayName: 'Painting Mid-Century Modern Flat',
    categoryId: 'painting',
    mediumId: 'paint-flat',
    description: 'Clean mid-century modern aesthetic with geometric shapes and a sophisticated color palette.',
    tags: ['Gouache', 'Mid-Century', 'Geometric', 'Modern', 'Sophisticated'],
    aboutText: 'Ideal for architectural and design-forward subjects.',
    palette: ['#F4A460', '#8B4513', '#D2691E', '#2F4F4F', '#708090'],
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
  },
  {
    id: '10300003',
    name: 'Children Book Illustration',
    displayName: 'Painting Children Book Illustration',
    categoryId: 'painting',
    mediumId: 'paint-flat',
    description: 'Warm, friendly illustration style perfect for children\'s content. Flat colors with charming details.',
    tags: ['Gouache', 'Illustration', 'Children', 'Friendly', 'Whimsical'],
    aboutText: 'Great for family-friendly content and storytelling.',
    palette: ['#FF9A9E', '#FECFEF', '#A1C4FD', '#C2E9FB', '#FFF1BD'],
    thumbnail: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=400&fit=crop'
  },
  {
    id: '10300004',
    name: 'Bold Graphic Animal',
    displayName: 'Painting Bold Graphic Animal',
    categoryId: 'painting',
    mediumId: 'paint-flat',
    description: 'Strong graphic animal portraits with bold shapes and striking color combinations.',
    tags: ['Gouache', 'Animal', 'Graphic', 'Bold', 'Contemporary'],
    aboutText: 'Perfect for pet portraits and wildlife art.',
    palette: ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33'],
    thumbnail: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=400&fit=crop'
  },
  {
    id: '10300005',
    name: 'Minimalist Nature Flat',
    displayName: 'Painting Minimalist Nature Flat',
    categoryId: 'painting',
    mediumId: 'paint-flat',
    description: 'Simple, minimalist approach to natural subjects. Clean lines and limited color palette.',
    tags: ['Gouache', 'Minimalist', 'Nature', 'Clean', 'Simple'],
    aboutText: 'Ideal for modern, understated nature art.',
    palette: ['#6B8E23', '#F5DEB3', '#DEB887', '#8FBC8F', '#FAF0E6'],
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop'
  },

  // DRAWING - Sketch (Pencil/Graphite)
  {
    id: '20100001',
    name: 'Detailed Realistic Pencil',
    displayName: 'Drawing Detailed Realistic Pencil',
    categoryId: 'drawing',
    mediumId: 'draw-sketch',
    description: 'Highly detailed, photorealistic pencil drawings with smooth tonal gradations and precise line work.',
    tags: ['Graphite', 'Realistic', 'Detailed', 'Tonal', 'Fine Art'],
    aboutText: 'Perfect for realistic portraits and detailed subjects.',
    palette: ['#2C3E50', '#7F8C8D', '#BDC3C7', '#ECF0F1', '#FFFFFF'],
    thumbnail: 'https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=400&h=400&fit=crop'
  },
  {
    id: '20100002',
    name: 'Loose Gestural Sketch',
    displayName: 'Drawing Loose Gestural Sketch',
    categoryId: 'drawing',
    mediumId: 'draw-sketch',
    description: 'Quick, expressive sketches capturing movement and energy. Loose lines with dynamic quality.',
    tags: ['Pencil', 'Gestural', 'Loose', 'Dynamic', 'Expressive'],
    aboutText: 'Great for capturing movement and energy.',
    palette: ['#34495E', '#95A5A6', '#BDC3C7', '#ECF0F1', '#FAFAFA'],
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop'
  },
  {
    id: '20100003',
    name: 'Architectural Precision',
    displayName: 'Drawing Architectural Precision',
    categoryId: 'drawing',
    mediumId: 'draw-sketch',
    description: 'Clean, precise architectural drawings with careful perspective and fine detail.',
    tags: ['Graphite', 'Architectural', 'Precise', 'Technical', 'Linear'],
    aboutText: 'Ideal for buildings and architectural subjects.',
    palette: ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#FFFFFF'],
    thumbnail: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=400&fit=crop'
  },
  {
    id: '20100004',
    name: 'Soft Portrait Study',
    displayName: 'Drawing Soft Portrait Study',
    categoryId: 'drawing',
    mediumId: 'draw-sketch',
    description: 'Gentle portrait drawings with soft shading and delicate features. Classical approach.',
    tags: ['Graphite', 'Portrait', 'Soft', 'Classical', 'Study'],
    aboutText: 'Beautiful for capturing likeness and personality.',
    palette: ['#4A4A4A', '#7A7A7A', '#AAAAAA', '#D4D4D4', '#F5F5F5'],
    thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop'
  },
  {
    id: '20100005',
    name: 'Nature Field Sketch',
    displayName: 'Drawing Nature Field Sketch',
    categoryId: 'drawing',
    mediumId: 'draw-sketch',
    description: 'Naturalist field sketch style with botanical and wildlife subjects. Scientific yet artistic.',
    tags: ['Pencil', 'Nature', 'Field Sketch', 'Botanical', 'Wildlife'],
    aboutText: 'Perfect for nature studies and scientific illustration.',
    palette: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9', '#FFFFFF'],
    thumbnail: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop'
  },

  // Add remaining mediums with similar pattern...
  // DRAWING - Bold Line (5 styles)
  {
    id: '20200001',
    name: 'Dramatic Charcoal Portrait',
    displayName: 'Drawing Dramatic Charcoal Portrait',
    categoryId: 'drawing',
    mediumId: 'draw-bold',
    description: 'High contrast charcoal portraits with bold strokes and dramatic lighting.',
    tags: ['Charcoal', 'Portrait', 'Dramatic', 'High Contrast', 'Expressive'],
    aboutText: 'Perfect for dramatic, emotional portraits.',
    palette: ['#000000', '#2C2C2C', '#5C5C5C', '#8C8C8C', '#FFFFFF'],
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
  },

  // DRAWING - Color Drawing (sample)
  {
    id: '20300001',
    name: 'Vibrant Pastel Portrait',
    displayName: 'Drawing Vibrant Pastel Portrait',
    categoryId: 'drawing',
    mediumId: 'draw-color',
    description: 'Rich, vibrant pastel portraits with soft blending and beautiful color.',
    tags: ['Pastel', 'Portrait', 'Vibrant', 'Blended', 'Colorful'],
    aboutText: 'Beautiful for colorful, emotive portraits.',
    palette: ['#E91E63', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800'],
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  },

  // PHOTOGRAPHY - Color (sample)
  {
    id: '30100001',
    name: 'Cinematic Color Grade',
    displayName: 'Photography Cinematic Color Grade',
    categoryId: 'photography',
    mediumId: 'photo-color',
    description: 'Film-like color grading with rich tones and cinematic mood.',
    tags: ['Photography', 'Cinematic', 'Color Grade', 'Film Look', 'Moody'],
    aboutText: 'Perfect for dramatic, movie-like imagery.',
    palette: ['#1A237E', '#FF6F00', '#004D40', '#BF360C', '#263238'],
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
  },

  // PHOTOGRAPHY - B&W (sample)
  {
    id: '30200001',
    name: 'Classic Film Noir',
    displayName: 'Photography Classic Film Noir',
    categoryId: 'photography',
    mediumId: 'photo-bw',
    description: 'Classic black and white with high contrast and dramatic shadows.',
    tags: ['Photography', 'Black & White', 'Film Noir', 'High Contrast', 'Dramatic'],
    aboutText: 'Ideal for dramatic, timeless imagery.',
    palette: ['#000000', '#333333', '#666666', '#999999', '#FFFFFF'],
    thumbnail: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop'
  },

  // PRINTMAKING - Carved (sample)
  {
    id: '40100001',
    name: 'Bold Linocut Nature',
    displayName: 'Printmaking Bold Linocut Nature',
    categoryId: 'printmaking',
    mediumId: 'print-carved',
    description: 'Bold, graphic linocut prints with strong contrast and organic shapes.',
    tags: ['Linocut', 'Nature', 'Bold', 'Graphic', 'Hand-carved'],
    aboutText: 'Perfect for bold nature and wildlife subjects.',
    palette: ['#000000', '#1B5E20', '#BF360C', '#01579B', '#FFFFFF'],
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop'
  },

  // PRINTMAKING - Fine Line (sample)
  {
    id: '40200001',
    name: 'Victorian Etching',
    displayName: 'Printmaking Victorian Etching',
    categoryId: 'printmaking',
    mediumId: 'print-fine',
    description: 'Intricate crosshatching in classic Victorian etching style.',
    tags: ['Etching', 'Victorian', 'Detailed', 'Crosshatch', 'Classic'],
    aboutText: 'Ideal for detailed, classic illustration style.',
    palette: ['#2C1810', '#5D4E37', '#8B7355', '#C4A77D', '#F5F5DC'],
    thumbnail: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=400&fit=crop'
  },

  // PRINTMAKING - Poster (sample)
  {
    id: '40300001',
    name: 'Pop Art Screenprint',
    displayName: 'Printmaking Pop Art Screenprint',
    categoryId: 'printmaking',
    mediumId: 'print-poster',
    description: 'Bold pop art style with limited colors and graphic impact.',
    tags: ['Screenprint', 'Pop Art', 'Bold', 'Limited Color', 'Graphic'],
    aboutText: 'Perfect for bold, eye-catching artwork.',
    palette: ['#FF1744', '#00E5FF', '#FFEA00', '#651FFF', '#000000'],
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
  },

  // COLLAGE - Paper (sample)
  {
    id: '50100001',
    name: 'Textured Paper Layers',
    displayName: 'Collage Textured Paper Layers',
    categoryId: 'collage',
    mediumId: 'collage-paper',
    description: 'Layered paper collage with torn edges and mixed textures.',
    tags: ['Paper', 'Collage', 'Textured', 'Layered', 'Mixed'],
    aboutText: 'Great for artistic, textured compositions.',
    palette: ['#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9'],
    thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop'
  },

  // COLLAGE - Photo (sample)
  {
    id: '50200001',
    name: 'Surreal Photo Montage',
    displayName: 'Collage Surreal Photo Montage',
    categoryId: 'collage',
    mediumId: 'collage-photo',
    description: 'Dreamlike photo collages combining unexpected elements.',
    tags: ['Photo', 'Collage', 'Surreal', 'Montage', 'Dreamlike'],
    aboutText: 'Perfect for creative, surreal compositions.',
    palette: ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#F0F0F0'],
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
  },

  // COLLAGE - Mixed (sample)
  {
    id: '50300001',
    name: 'Digital Mixed Media',
    displayName: 'Collage Digital Mixed Media',
    categoryId: 'collage',
    mediumId: 'collage-mixed',
    description: 'Contemporary mixed media combining digital and traditional elements.',
    tags: ['Mixed Media', 'Digital', 'Contemporary', 'Experimental', 'Layered'],
    aboutText: 'Ideal for modern, experimental artwork.',
    palette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop'
  }
];

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get all mediums for a category
 */
function getMediumsByCategory(categoryId) {
  const category = MEDIUM_MATRIX.categories.find(c => c.id === categoryId);
  return category ? category.mediums : [];
}

/**
 * Get all styles for a medium
 */
function getStylesByMedium(mediumId) {
  return SAMPLE_STYLES.filter(style => style.mediumId === mediumId);
}

/**
 * Get styles count for each medium
 */
function getMediumStyleCounts() {
  const counts = {};
  SAMPLE_STYLES.forEach(style => {
    counts[style.mediumId] = (counts[style.mediumId] || 0) + 1;
  });
  return counts;
}

/**
 * Get category total style count
 */
function getCategoryStyleCount(categoryId) {
  return SAMPLE_STYLES.filter(style => style.categoryId === categoryId).length;
}

/**
 * Search styles by keyword
 */
function searchStyles(query) {
  const lowerQuery = query.toLowerCase();
  return SAMPLE_STYLES.filter(style => 
    style.name.toLowerCase().includes(lowerQuery) ||
    style.displayName.toLowerCase().includes(lowerQuery) ||
    style.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    style.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get style by ID
 */
function getStyleById(id) {
  return SAMPLE_STYLES.find(style => style.id === id);
}

// ========================================
// LOCAL STORAGE HELPERS (for test site)
// ========================================

const STORAGE_KEYS = {
  favorites: 'societyarts_favorites',
  collections: 'societyarts_collections',
  projects: 'societyarts_projects'
};

/**
 * Get favorites from localStorage
 */
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)) || [];
  } catch (e) {
    return [];
  }
}

/**
 * Add to favorites
 */
function addToFavorites(styleId) {
  const favorites = getFavorites();
  if (!favorites.includes(styleId)) {
    favorites.push(styleId);
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }
  return favorites;
}

/**
 * Remove from favorites
 */
function removeFromFavorites(styleId) {
  let favorites = getFavorites();
  favorites = favorites.filter(id => id !== styleId);
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  return favorites;
}

/**
 * Get collections from localStorage
 */
function getCollections() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.collections)) || {};
  } catch (e) {
    return {};
  }
}

/**
 * Add style to collection
 */
function addToCollection(collectionName, styleId) {
  const collections = getCollections();
  if (!collections[collectionName]) {
    collections[collectionName] = [];
  }
  if (!collections[collectionName].includes(styleId)) {
    collections[collectionName].push(styleId);
    localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(collections));
  }
  return collections;
}

// ========================================
// EXPORTS
// ========================================

if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.StyleData = {
    MEDIUM_MATRIX,
    SAMPLE_STYLES,
    getMediumsByCategory,
    getStylesByMedium,
    getMediumStyleCounts,
    getCategoryStyleCount,
    searchStyles,
    getStyleById,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    getCollections,
    addToCollection,
    STORAGE_KEYS
  };
}
