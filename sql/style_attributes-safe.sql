-- ============================================
-- SOCIETY ARTS - STYLE ATTRIBUTES TABLE
-- SAFE VERSION - handles existing objects
-- For Style Finder 2 Faceted Navigation
-- ============================================

-- Drop existing table if it exists with wrong type (optional - uncomment if needed)
-- DROP TABLE IF EXISTS style_attributes CASCADE;

-- Create style_attributes table for the 14 mediums + 8 overlays system
-- NOTE: style_id is VARCHAR to match styles.id column type
CREATE TABLE IF NOT EXISTS style_attributes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    style_id VARCHAR(255) NOT NULL,
    
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

-- Add foreign key constraint only if styles table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'styles') THEN
        -- Check if constraint already exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'style_attributes_style_id_fkey' 
            AND table_name = 'style_attributes'
        ) THEN
            ALTER TABLE style_attributes 
            ADD CONSTRAINT style_attributes_style_id_fkey 
            FOREIGN KEY (style_id) REFERENCES styles(id) ON DELETE CASCADE;
        END IF;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If foreign key fails, just skip it - we can still use the table without it
    RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
END $$;

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_style_attributes_style_id ON style_attributes(style_id);
CREATE INDEX IF NOT EXISTS idx_style_attributes_medium ON style_attributes(medium);
CREATE INDEX IF NOT EXISTS idx_style_attributes_medium_category ON style_attributes(medium_category);
CREATE INDEX IF NOT EXISTS idx_style_attributes_overlay ON style_attributes(overlay);
CREATE INDEX IF NOT EXISTS idx_style_attributes_popularity ON style_attributes(popularity_score DESC);

-- Enable RLS
ALTER TABLE style_attributes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view style attributes" ON style_attributes;
CREATE POLICY "Anyone can view style attributes"
    ON style_attributes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Super admins can manage style attributes" ON style_attributes;
CREATE POLICY "Super admins can manage style attributes"
    ON style_attributes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
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

-- Note: This view only references columns that exist in your styles table
-- Adjust the SELECT columns based on your actual styles table schema
CREATE OR REPLACE VIEW styles_with_attributes AS
SELECT 
    s.id,
    s.name,
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
LEFT JOIN overlays o ON sa.overlay = o.id;

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

DROP TRIGGER IF EXISTS trigger_style_attributes_updated_at ON style_attributes;
CREATE TRIGGER trigger_style_attributes_updated_at
    BEFORE UPDATE ON style_attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_style_attributes_updated_at();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Style attributes schema migration completed successfully!' as status;
