// Society Arts - Style Data Module
// Fetches styles from Supabase and provides filtering/search functionality

// ============================================
// CONFIGURATION
// ============================================

const STYLES_PER_PAGE = 24;

// ============================================
// LOOKUP TABLES (cached from Supabase)
// ============================================

let lookupTables = {
    art_types: [],
    compositions: [],
    cultures: [],
    eras: [],
    inspirations: [],
    lighting: [],
    mediums: [],
    occasions: [],
    palettes: [],
    subjects: [],
    techniques: [],
    themes: [],
    vibes: []
};

// ============================================
// STATE
// ============================================

let allStyles = [];
let filteredStyles = [];
let currentPage = 0;
let activeFilters = {};
let isLoading = false;

// ============================================
// INITIALIZATION
// ============================================

async function initializeStyleData() {
    console.log('Initializing Style Data from Supabase...');
    
    try {
        // Load lookup tables in parallel
        await loadLookupTables();
        
        // Load initial styles
        await loadStyles();
        
        console.log(`Loaded ${allStyles.length} styles`);
        return true;
    } catch (error) {
        console.error('Failed to initialize style data:', error);
        return false;
    }
}

// ============================================
// LOOKUP TABLE LOADING
// ============================================

async function loadLookupTables() {
    const { supabase } = window.SocietyArts;
    
    const tableNames = Object.keys(lookupTables);
    
    const promises = tableNames.map(async (tableName) => {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('name');
        
        if (error) {
            console.warn(`Failed to load ${tableName}:`, error);
            return;
        }
        
        lookupTables[tableName] = data || [];
    });
    
    await Promise.all(promises);
    console.log('Lookup tables loaded:', Object.keys(lookupTables).map(k => `${k}: ${lookupTables[k].length}`));
}

// ============================================
// STYLE LOADING
// ============================================

async function loadStyles(filters = {}) {
    const { supabase } = window.SocietyArts;
    isLoading = true;
    
    try {
        let query = supabase
            .from('styles')
            .select(`
                id,
                name,
                tagline,
                description,
                thumbnail_url,
                art_type_id,
                culture_id,
                era_id,
                primary_medium_id,
                primary_palette_id,
                primary_lighting_id,
                primary_composition_id,
                complexity,
                best_format,
                best_size,
                audience_rating,
                is_featured,
                is_new,
                is_active,
                sref_code
            `)
            .eq('is_active', true)
            .not('name', 'is', null)
            .order('name');
        
        // Apply filters
        if (filters.art_type_id) {
            query = query.eq('art_type_id', filters.art_type_id);
        }
        if (filters.primary_medium_id) {
            query = query.eq('primary_medium_id', filters.primary_medium_id);
        }
        if (filters.culture_id) {
            query = query.eq('culture_id', filters.culture_id);
        }
        if (filters.era_id) {
            query = query.eq('era_id', filters.era_id);
        }
        if (filters.primary_palette_id) {
            query = query.eq('primary_palette_id', filters.primary_palette_id);
        }
        if (filters.primary_lighting_id) {
            query = query.eq('primary_lighting_id', filters.primary_lighting_id);
        }
        if (filters.primary_composition_id) {
            query = query.eq('primary_composition_id', filters.primary_composition_id);
        }
        if (filters.complexity) {
            query = query.eq('complexity', filters.complexity);
        }
        
        const { data, error } = await query;
        
        if (error) {
            throw error;
        }
        
        allStyles = (data || []).map(style => ({
            ...style,
            thumbnail: style.thumbnail_url || window.SocietyArts.getStyleImageUrl(style.id, 0),
            images: window.SocietyArts.getAllStyleImageUrls(style.id)
        }));
        
        filteredStyles = [...allStyles];
        currentPage = 0;
        
        return allStyles;
    } catch (error) {
        console.error('Failed to load styles:', error);
        throw error;
    } finally {
        isLoading = false;
    }
}

// ============================================
// SEARCH & FILTERING
// ============================================

function searchStyles(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        filteredStyles = [...allStyles];
    } else {
        const term = searchTerm.toLowerCase().trim();
        filteredStyles = allStyles.filter(style => 
            style.name?.toLowerCase().includes(term) ||
            style.description?.toLowerCase().includes(term) ||
            style.tagline?.toLowerCase().includes(term)
        );
    }
    currentPage = 0;
    return filteredStyles;
}

async function applyFilters(filters) {
    activeFilters = { ...filters };
    await loadStyles(filters);
    return filteredStyles;
}

function clearFilters() {
    activeFilters = {};
    return loadStyles();
}

// ============================================
// PAGINATION
// ============================================

function getPagedStyles(page = 0) {
    const start = page * STYLES_PER_PAGE;
    const end = start + STYLES_PER_PAGE;
    return filteredStyles.slice(start, end);
}

function getCurrentPageStyles() {
    return getPagedStyles(currentPage);
}

function nextPage() {
    if ((currentPage + 1) * STYLES_PER_PAGE < filteredStyles.length) {
        currentPage++;
        return getCurrentPageStyles();
    }
    return null;
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        return getCurrentPageStyles();
    }
    return null;
}

function getTotalPages() {
    return Math.ceil(filteredStyles.length / STYLES_PER_PAGE);
}

// ============================================
// SINGLE STYLE RETRIEVAL
// ============================================

async function getStyleById(styleId) {
    const { supabase } = window.SocietyArts;
    
    const { data, error } = await supabase
        .from('styles')
        .select('*')
        .eq('id', styleId)
        .single();
    
    if (error) {
        console.error('Failed to get style:', error);
        return null;
    }
    
    return {
        ...data,
        thumbnail: data.thumbnail_url || window.SocietyArts.getStyleImageUrl(styleId, 0),
        images: window.SocietyArts.getAllStyleImageUrls(styleId)
    };
}

async function getPromptsForStyle(styleId) {
    const { supabase } = window.SocietyArts;
    
    const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('style_id', styleId)
        .order('sort_order');
    
    if (error) {
        console.error('Failed to get prompts:', error);
        return [];
    }
    
    return data || [];
}

// ============================================
// LOOKUP HELPERS
// ============================================

function getLookupName(tableName, id) {
    const table = lookupTables[tableName];
    if (!table) return null;
    const item = table.find(row => row.id === id);
    return item?.name || null;
}

function getLookupOptions(tableName) {
    return lookupTables[tableName] || [];
}

// ============================================
// FAVORITES (localStorage)
// ============================================

const FAVORITES_KEY = 'society-arts-favorites';

function getFavorites() {
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function addFavorite(styleId) {
    const favorites = getFavorites();
    if (!favorites.includes(styleId)) {
        favorites.push(styleId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    return favorites;
}

function removeFavorite(styleId) {
    const favorites = getFavorites().filter(id => id !== styleId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return favorites;
}

function isFavorite(styleId) {
    return getFavorites().includes(styleId);
}

function toggleFavorite(styleId) {
    if (isFavorite(styleId)) {
        return { favorites: removeFavorite(styleId), added: false };
    } else {
        return { favorites: addFavorite(styleId), added: true };
    }
}

// ============================================
// EXPORT
// ============================================

window.SocietyArts = window.SocietyArts || {};
Object.assign(window.SocietyArts, {
    // Initialization
    initializeStyleData,
    
    // Loading
    loadStyles,
    loadLookupTables,
    
    // Search & Filter
    searchStyles,
    applyFilters,
    clearFilters,
    activeFilters: () => activeFilters,
    
    // Pagination
    getPagedStyles,
    getCurrentPageStyles,
    nextPage,
    prevPage,
    getTotalPages,
    currentPage: () => currentPage,
    
    // Single style
    getStyleById,
    getPromptsForStyle,
    
    // Lookups
    getLookupName,
    getLookupOptions,
    lookupTables: () => lookupTables,
    
    // Favorites
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    
    // State
    allStyles: () => allStyles,
    filteredStyles: () => filteredStyles,
    isLoading: () => isLoading,
    STYLES_PER_PAGE
});
