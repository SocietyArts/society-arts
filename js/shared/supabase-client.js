// Society Arts - Supabase Client Configuration
// This file connects the StyleFinder to your Supabase database

const SUPABASE_URL = 'https://yspxlhcebcijeuemkaed.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcHhsaGNlYmNpamV1ZW1rYWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTczMTQsImV4cCI6MjA4MTg5MzMxNH0.MD0xQGkLnNdQ4hebC06lijU96AbPHPULhW_vjXuiGGE';
const R2_BASE_URL = 'https://pub-acb560f551f141db830964aed1fa005f.r2.dev';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to get image URL for a style
function getStyleImageUrl(styleId, imageIndex = 0) {
    const paddedIndex = String(imageIndex).padStart(2, '0');
    return `${R2_BASE_URL}/${styleId}/${styleId}-${paddedIndex}.webp`;
}

// Helper function to get all image URLs for a style (10 images)
function getAllStyleImageUrls(styleId) {
    return Array.from({ length: 10 }, (_, i) => getStyleImageUrl(styleId, i));
}

// Export for use in other modules
window.SocietyArts = window.SocietyArts || {};
window.SocietyArts.supabase = supabaseClient;
window.SocietyArts.getStyleImageUrl = getStyleImageUrl;
window.SocietyArts.getAllStyleImageUrls = getAllStyleImageUrls;
window.SocietyArts.R2_BASE_URL = R2_BASE_URL;

console.log('Supabase client initialized successfully');