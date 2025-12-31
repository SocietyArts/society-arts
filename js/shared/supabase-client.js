// Society Arts - Supabase Client Configuration
// This file connects the StyleFinder to your Supabase database

const SUPABASE_URL = 'https://yspxlhcebcijeuemkaed.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcHhsaGNlYmNpamV1ZW1rYWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMTQsImV4cCI6MjA4MTg5MzMxNH0.MD0xQGkLnNdQ4hebC06lijU96AbPHPULhW_vjXuiGGE';
const R2_BASE_URL = 'https://pub-acb560f551f141db830964aed1fa005f.r2.dev';

// ============================================
// IMAGE OPTIMIZATION CONFIGURATION
// ============================================
// Using Netlify Image CDN for on-demand resizing and format optimization

const IMAGE_CONFIG = {
    // Enable/disable Netlify Image CDN (set to false to use direct R2 URLs)
    useNetlifyImageCDN: true,
    
    // Image size presets (width in pixels)
    sizes: {
        thumbnail: 300,    // Grid cards in style finder
        preview: 600,      // Hover previews, modal thumbnails
        full: 1200,        // Detail view, lightbox
        original: null     // No resize, original size
    }
};

// Initialize Supabase client (using different variable name to avoid conflicts)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// IMAGE URL HELPERS
// ============================================

/**
 * Get the raw R2 URL for an image (no optimization)
 */
function getRawImageUrl(styleId, imageIndex = 0) {
    const paddedIndex = String(imageIndex).padStart(2, '0');
    return `${R2_BASE_URL}/${styleId}/${styleId}-${paddedIndex}.webp`;
}

/**
 * Get optimized image URL through Netlify Image CDN
 * @param {string} styleId - The style ID
 * @param {number} imageIndex - Image index (0-9)
 * @param {number|null} width - Target width in pixels, null for original
 * @returns {string} Optimized image URL
 */
function getStyleImageUrl(styleId, imageIndex = 0, width = null) {
    const rawUrl = getRawImageUrl(styleId, imageIndex);
    
    // If Netlify CDN disabled or no width specified, return raw URL
    if (!IMAGE_CONFIG.useNetlifyImageCDN) {
        return rawUrl;
    }
    
    // Build Netlify Image CDN URL
    // Format: /.netlify/images?url=<encoded-url>&w=<width>
    const params = new URLSearchParams();
    params.set('url', rawUrl);
    
    if (width) {
        params.set('w', width);
    }
    
    // Netlify auto-selects best format (WebP/AVIF) based on browser
    return `/.netlify/images?${params.toString()}`;
}

/**
 * Get thumbnail URL (optimized for grid display)
 */
function getStyleThumbnailUrl(styleId, imageIndex = 0) {
    return getStyleImageUrl(styleId, imageIndex, IMAGE_CONFIG.sizes.thumbnail);
}

/**
 * Get preview URL (optimized for hover/modal preview)
 */
function getStylePreviewUrl(styleId, imageIndex = 0) {
    return getStyleImageUrl(styleId, imageIndex, IMAGE_CONFIG.sizes.preview);
}

/**
 * Get full size URL (optimized for detail/lightbox view)
 */
function getStyleFullUrl(styleId, imageIndex = 0) {
    return getStyleImageUrl(styleId, imageIndex, IMAGE_CONFIG.sizes.full);
}

/**
 * Get all image URLs for a style (10 images) at specified size
 * @param {string} styleId - The style ID
 * @param {string} size - Size preset: 'thumbnail', 'preview', 'full', or 'original'
 */
function getAllStyleImageUrls(styleId, size = 'preview') {
    const width = IMAGE_CONFIG.sizes[size] || null;
    return Array.from({ length: 10 }, (_, i) => getStyleImageUrl(styleId, i, width));
}

/**
 * Get srcset for responsive images
 * Returns srcset string for use in <img srcset="...">
 */
function getStyleSrcSet(styleId, imageIndex = 0) {
    const sizes = [300, 600, 1200];
    return sizes.map(w => {
        const url = getStyleImageUrl(styleId, imageIndex, w);
        return `${url} ${w}w`;
    }).join(', ');
}

// ============================================
// ALTERNATE BUCKET HELPERS (for legacy pages)
// ============================================
// Some pages use the alternate R2 bucket with different naming convention

const R2_ALT_BASE_URL = 'https://pub-d4d49982f29749dea52e2eb37c29ad51.r2.dev';

/**
 * Get optimized image URL for alternate bucket (legacy format)
 * Uses _1.webp naming convention instead of -00.webp
 */
function getAltStyleThumbnailUrl(styleId) {
    const rawUrl = `${R2_ALT_BASE_URL}/${styleId}/${styleId}_1.webp`;
    
    if (!IMAGE_CONFIG.useNetlifyImageCDN) {
        return rawUrl;
    }
    
    const params = new URLSearchParams();
    params.set('url', rawUrl);
    params.set('w', IMAGE_CONFIG.sizes.thumbnail);
    
    return `/.netlify/images?${params.toString()}`;
}

/**
 * Convert any raw R2 URL to optimized Netlify CDN URL
 */
function getOptimizedImageUrl(rawUrl, width = null) {
    if (!IMAGE_CONFIG.useNetlifyImageCDN) {
        return rawUrl;
    }
    
    const params = new URLSearchParams();
    params.set('url', rawUrl);
    
    if (width) {
        params.set('w', width);
    }
    
    return `/.netlify/images?${params.toString()}`;
}

// ============================================
// EXPORT
// ============================================

window.SocietyArts = window.SocietyArts || {};
window.SocietyArts.supabase = supabaseClient;
window.SocietyArts.R2_BASE_URL = R2_BASE_URL;
window.SocietyArts.R2_ALT_BASE_URL = R2_ALT_BASE_URL;
window.SocietyArts.IMAGE_CONFIG = IMAGE_CONFIG;

// Image URL functions
window.SocietyArts.getStyleImageUrl = getStyleImageUrl;
window.SocietyArts.getStyleThumbnailUrl = getStyleThumbnailUrl;
window.SocietyArts.getStylePreviewUrl = getStylePreviewUrl;
window.SocietyArts.getStyleFullUrl = getStyleFullUrl;
window.SocietyArts.getAllStyleImageUrls = getAllStyleImageUrls;
window.SocietyArts.getStyleSrcSet = getStyleSrcSet;
window.SocietyArts.getRawImageUrl = getRawImageUrl;

// Alternate bucket functions (legacy pages)
window.SocietyArts.getAltStyleThumbnailUrl = getAltStyleThumbnailUrl;
window.SocietyArts.getOptimizedImageUrl = getOptimizedImageUrl;

console.log('Supabase client initialized with Netlify Image CDN support');
