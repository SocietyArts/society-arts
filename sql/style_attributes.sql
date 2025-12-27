-- ============================================
-- SOCIETY ARTS - STYLE ATTRIBUTES TABLE
-- For Style Finder 2 Faceted Navigation
-- ============================================

-- Create style_attributes table for the 14 mediums + 8 overlays system
CREATE TABLE IF NOT EXISTS style_attributes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
    
    -- Medium (one of 14 options)
    medium VARCHAR(100),
    -- Values:
    -- Painting: 'bold_paint_oil_acrylic', 'fluid_paint_watercolor', 'flat_paint_poster_gouache'
    -- Drawing: 'sketch_pencil_graphite', 'bold_line_ink_charcoal', 'color_drawing_pastel_colored_pencil'
    -- Photography: 'color_photography', 'black_white_photography'
    -- Printmaking: 'bold_carved_print_woodcut_linocut', 'fine_line_print_etching_engraving', 'poster_print_screenprint'
    -- Collage/Mixed Media: 'paper_collage', 'photo_collage', 'mixed_layers'
    
    -- Medium Category (derived from medium, for easier filtering)
    medium_category VARCHAR(50),
    -- Values: 'painting', 'drawing', 'photography', 'printmaking', 'collage_mixed_media'
    
    -- Overlay/Style (one of 8 options)
    overlay VARCHAR(50),
    -- Values: 'abstract', 'realistic', 'cinematic', 'experimental', 'minimalist', 'whimsical', 'illustration', 'historic'
    
    -- Popularity score (for sorting)
    popularity_score INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint - one attributes record per style
    UNIQUE(style_id)
);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_style_attributes_style_id ON style_attributes(style_id);
CREATE INDEX IF NOT EXISTS idx_style_attributes_medium ON style_attributes(medium);
CREATE INDEX IF NOT EXISTS idx_style_attributes_medium_category ON style_attributes(medium_category);
CREATE INDEX IF NOT EXISTS idx_style_attributes_overlay ON style_attributes(overlay);
CREATE INDEX IF NOT EXISTS idx_style_attributes_popularity ON style_attributes(popularity_score DESC);

-- Enable RLS
ALTER TABLE style_attributes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can read
CREATE POLICY "Anyone can view style attributes"
    ON style_attributes FOR SELECT
    USING (true);

-- Only super_admins can insert/update/delete
CREATE POLICY "Super admins can manage style attributes"
    ON style_attributes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role = 'super_admin'
        )
    );

-- ============================================
-- LOOKUP TABLES FOR REFERENCE
-- ============================================

-- Medium categories lookup
CREATE TABLE IF NOT EXISTS medium_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO medium_categories (id, name, display_order) VALUES
    ('painting', 'Painting', 1),
    ('drawing', 'Drawing', 2),
    ('photography', 'Photography', 3),
    ('printmaking', 'Printmaking', 4),
    ('collage_mixed_media', 'Collage / Mixed Media', 5)
ON CONFLICT (id) DO NOTHING;

-- Mediums lookup
CREATE TABLE IF NOT EXISTS mediums_v2 (
    id VARCHAR(100) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL REFERENCES medium_categories(id),
    name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO mediums_v2 (id, category_id, name, display_order) VALUES
    -- Painting
    ('bold_paint_oil_acrylic', 'painting', 'Bold Paint (Oil/Acrylic)', 1),
    ('fluid_paint_watercolor', 'painting', 'Fluid Paint (Watercolor)', 2),
    ('flat_paint_poster_gouache', 'painting', 'Flat Paint (Poster/Gouache)', 3),
    -- Drawing
    ('sketch_pencil_graphite', 'drawing', 'Pencil/Graphite', 1),
    ('bold_line_ink_charcoal', 'drawing', 'Ink/Charcoal', 2),
    ('color_drawing_pastel_colored_pencil', 'drawing', 'Pastel/Colored Pencil', 3),
    -- Photography
    ('color_photography', 'photography', 'Color', 1),
    ('black_white_photography', 'photography', 'Black & White', 2),
    -- Printmaking
    ('bold_carved_print_woodcut_linocut', 'printmaking', 'Woodcut/Linocut', 1),
    ('fine_line_print_etching_engraving', 'printmaking', 'Etching/Engraving', 2),
    ('poster_print_screenprint', 'printmaking', 'Screenprint', 3),
    -- Collage / Mixed Media
    ('paper_collage', 'collage_mixed_media', 'Paper Collage', 1),
    ('photo_collage', 'collage_mixed_media', 'Photo Collage', 2),
    ('mixed_layers', 'collage_mixed_media', 'Mixed Layers', 3)
ON CONFLICT (id) DO NOTHING;

-- Overlays lookup
CREATE TABLE IF NOT EXISTS overlays (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO overlays (id, name, display_order) VALUES
    ('abstract', 'Abstract', 1),
    ('realistic', 'Realistic', 2),
    ('cinematic', 'Cinematic', 3),
    ('experimental', 'Experimental', 4),
    ('minimalist', 'Minimalist', 5),
    ('whimsical', 'Whimsical', 6),
    ('illustration', 'Illustration', 7),
    ('historic', 'Historic', 8)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HELPER VIEW FOR EASY QUERYING
-- ============================================

CREATE OR REPLACE VIEW styles_with_attributes AS
SELECT 
    s.id,
    s.name,
    s.image_urls,
    s.status,
    s.created_at,
    sa.medium,
    sa.medium_category,
    sa.overlay,
    sa.popularity_score,
    mc.name as medium_category_name,
    m.name as medium_name,
    o.name as overlay_name
FROM styles s
LEFT JOIN style_attributes sa ON s.id = sa.style_id
LEFT JOIN medium_categories mc ON sa.medium_category = mc.id
LEFT JOIN mediums_v2 m ON sa.medium = m.id
LEFT JOIN overlays o ON sa.overlay = o.id
WHERE s.status = 'active';

-- ============================================
-- FUNCTION TO UPDATE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_style_attributes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_style_attributes_updated_at
    BEFORE UPDATE ON style_attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_style_attributes_updated_at();
