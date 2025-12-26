// Society Arts - Style Data Module
// Fetches styles from Supabase and provides filtering/search functionality

// ============================================
// CONFIGURATION
// ============================================

const STYLES_PER_PAGE = 24;

// Google Sheets for reporting
const GOOGLE_SHEETS = {
    swapImage: '1FmiVUFTZQ9_GvUzh1FR_iu5HJilnHyeIg4sVr3f7Ei4',
    deleteStyle: '1_j2HLnfFhN1PdYEjiZz7PJPHUc5KqV2u63v2oHTrNrA'
};

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
let currentSearchTerm = '';

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
    
    console.log('loadStyles called with filters:', filters);
    
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
        
        // Apply filters - IDs are strings (varchar), complexity is integer
        if (filters.art_type_id) {
            console.log(`Filtering by art_type_id: "${filters.art_type_id}"`);
            query = query.eq('art_type_id', filters.art_type_id);
        }
        if (filters.primary_medium_id) {
            console.log(`Filtering by primary_medium_id: "${filters.primary_medium_id}"`);
            query = query.eq('primary_medium_id', filters.primary_medium_id);
        }
        if (filters.culture_id) {
            console.log(`Filtering by culture_id: "${filters.culture_id}"`);
            query = query.eq('culture_id', filters.culture_id);
        }
        if (filters.era_id) {
            console.log(`Filtering by era_id: "${filters.era_id}"`);
            query = query.eq('era_id', filters.era_id);
        }
        if (filters.primary_palette_id) {
            console.log(`Filtering by primary_palette_id: "${filters.primary_palette_id}"`);
            query = query.eq('primary_palette_id', filters.primary_palette_id);
        }
        if (filters.primary_lighting_id) {
            console.log(`Filtering by primary_lighting_id: "${filters.primary_lighting_id}"`);
            query = query.eq('primary_lighting_id', filters.primary_lighting_id);
        }
        if (filters.primary_composition_id) {
            console.log(`Filtering by primary_composition_id: "${filters.primary_composition_id}"`);
            query = query.eq('primary_composition_id', filters.primary_composition_id);
        }
        if (filters.complexity) {
            console.log(`Filtering by complexity: ${filters.complexity}`);
            query = query.eq('complexity', filters.complexity);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }
        
        console.log(`Query returned ${data?.length || 0} styles`);
        
        allStyles = (data || []).map(style => {
            // Enrich style with lookup names for searching
            return {
                ...style,
                thumbnail: style.thumbnail_url || window.SocietyArts.getStyleImageUrl(style.id, 0),
                images: window.SocietyArts.getAllStyleImageUrls(style.id),
                // Add searchable text from lookups
                _artTypeName: getLookupName('art_types', style.art_type_id) || '',
                _mediumName: getLookupName('mediums', style.primary_medium_id) || '',
                _cultureName: getLookupName('cultures', style.culture_id) || '',
                _eraName: getLookupName('eras', style.era_id) || '',
                _paletteName: getLookupName('palettes', style.primary_palette_id) || '',
                _lightingName: getLookupName('lighting', style.primary_lighting_id) || '',
                _compositionName: getLookupName('compositions', style.primary_composition_id) || ''
            };
        });
        
        // Re-apply search if there was one
        if (currentSearchTerm) {
            searchStyles(currentSearchTerm);
        } else {
            filteredStyles = [...allStyles];
        }
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
// SMART SEARCH
// ============================================

function searchStyles(searchTerm) {
    currentSearchTerm = searchTerm;
    
    if (!searchTerm || searchTerm.trim() === '') {
        filteredStyles = [...allStyles];
        currentPage = 0;
        return filteredStyles;
    }
    
    // Split search into multiple terms (space-separated)
    const terms = searchTerm.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    
    filteredStyles = allStyles.filter(style => {
        // Build searchable text from all relevant fields
        const searchableText = [
            style.name,
            style.tagline,
            style.description,
            style.id,
            style.sref_code,
            style._artTypeName,
            style._mediumName,
            style._cultureName,
            style._eraName,
            style._paletteName,
            style._lightingName,
            style._compositionName
        ].filter(Boolean).join(' ').toLowerCase();
        
        // ALL terms must match (AND logic)
        return terms.every(term => searchableText.includes(term));
    });
    
    currentPage = 0;
    return filteredStyles;
}

async function applyFilters(filters) {
    activeFilters = { ...filters };
    console.log('applyFilters called:', filters);
    await loadStyles(filters);
    return filteredStyles;
}

function clearFilters() {
    activeFilters = {};
    currentSearchTerm = '';
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
    if (!table || !id) return null;
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
// COLLECTIONS (localStorage)
// ============================================

const COLLECTIONS_KEY = 'society-arts-collections';

function getCollections() {
    try {
        const stored = localStorage.getItem(COLLECTIONS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCollections(collections) {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

function createCollection(name) {
    const collections = getCollections();
    const newCollection = {
        id: 'col_' + Date.now(),
        name: name,
        styleIds: [],
        createdAt: new Date().toISOString()
    };
    collections.push(newCollection);
    saveCollections(collections);
    return newCollection;
}

function deleteCollection(collectionId) {
    const collections = getCollections().filter(c => c.id !== collectionId);
    saveCollections(collections);
    return collections;
}

function addToCollection(collectionId, styleId) {
    const collections = getCollections();
    const collection = collections.find(c => c.id === collectionId);
    if (collection && !collection.styleIds.includes(styleId)) {
        collection.styleIds.push(styleId);
        saveCollections(collections);
    }
    return collections;
}

function removeFromCollection(collectionId, styleId) {
    const collections = getCollections();
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
        collection.styleIds = collection.styleIds.filter(id => id !== styleId);
        saveCollections(collections);
    }
    return collections;
}

function getStyleCollections(styleId) {
    return getCollections().filter(c => c.styleIds.includes(styleId));
}

// ============================================
// SAVED STYLES (localStorage - separate from favorites)
// ============================================

const SAVED_KEY = 'society-arts-saved';

function getSavedStyles() {
    try {
        const stored = localStorage.getItem(SAVED_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveStyle(styleId) {
    const saved = getSavedStyles();
    if (!saved.includes(styleId)) {
        saved.push(styleId);
        localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    }
    return saved;
}

function unsaveStyle(styleId) {
    const saved = getSavedStyles().filter(id => id !== styleId);
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    return saved;
}

function isStyleSaved(styleId) {
    return getSavedStyles().includes(styleId);
}

// ============================================
// REPORT STYLE (Google Sheets)
// ============================================

async function reportStyle(styleId, reportType) {
    const sheetId = reportType === 'swap' ? GOOGLE_SHEETS.swapImage : GOOGLE_SHEETS.deleteStyle;
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
    
    try {
        // Copy style ID to clipboard
        await navigator.clipboard.writeText(styleId);
        
        // Open the sheet
        window.open(sheetUrl, '_blank');
        
        return {
            success: true,
            message: `Style ID "${styleId}" copied to clipboard. Please paste it in the opened spreadsheet.`
        };
    } catch (error) {
        console.error('Report failed:', error);
        return {
            success: false,
            message: 'Failed to report style. Please try again.'
        };
    }
}

// ============================================
// DOWNLOAD IMAGE
// ============================================

async function downloadImage(imageUrl, filename) {
    try {
        // Due to CORS, we'll open the image in a new tab for the user to save
        window.open(imageUrl, '_blank');
        return true;
    } catch (error) {
        console.error('Download failed:', error);
        window.open(imageUrl, '_blank');
        return false;
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
    
    // Collections
    getCollections,
    createCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    getStyleCollections,
    
    // Saved
    getSavedStyles,
    saveStyle,
    unsaveStyle,
    isStyleSaved,
    
    // Reporting
    reportStyle,
    
    // Download
    downloadImage,
    
    // State
    allStyles: () => allStyles,
    filteredStyles: () => filteredStyles,
    isLoading: () => isLoading,
    STYLES_PER_PAGE
});
