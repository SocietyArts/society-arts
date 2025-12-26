// Society Arts - Style Data Module
// Fetches styles from Supabase using junction tables for filtering

// ============================================
// CONFIGURATION
// ============================================

const STYLES_PER_PAGE = 24;

// Google Sheets for reporting
const GOOGLE_SHEETS = {
    swapImage: '1FmiVUFTZQ9_GvUzh1FR_iu5HJilnHyeIg4sVr3f7Ei4',
    deleteStyle: '1_j2HLnfFhN1PdYEjiZz7PJPHUc5KqV2u63v2oHTrNrA'
};

// Junction table mapping - filter key to junction table info
const JUNCTION_TABLES = {
    art_type_id: { table: 'style_art_types', column: 'art_type_id' },
    primary_medium_id: { table: 'style_mediums', column: 'medium_id' },
    culture_id: { table: 'style_cultures', column: 'culture_id' },
    era_id: { table: 'style_eras', column: 'era_id' },
    primary_palette_id: { table: 'style_palettes', column: 'palette_id' },
    primary_lighting_id: { table: 'style_lighting', column: 'lighting_id' },
    primary_composition_id: { table: 'style_compositions', column: 'composition_id' }
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
let facetCounts = {}; // Stores available options with counts
let currentSort = 'quality'; // Default sort
let minQualityScore = 0; // Minimum quality score filter (0 = show all)

// Sort options
const SORT_OPTIONS = {
    quality: { label: 'Quality Score', field: 'quality_score', direction: 'desc' },
    qualityAsc: { label: 'Quality: Low to High', field: 'quality_score', direction: 'asc' },
    newest: { label: 'Newest Arrivals', field: 'created_at', direction: 'desc' },
    featured: { label: 'Featured', field: 'is_featured', direction: 'desc' },
    nameAsc: { label: 'Name: A to Z', field: 'name', direction: 'asc' },
    nameDesc: { label: 'Name: Z to A', field: 'name', direction: 'desc' }
};

// Quality filter thresholds
const QUALITY_THRESHOLDS = [
    { value: 0, label: 'All Scores' },
    { value: 6, label: '6+ and above' },
    { value: 7, label: '7+ and above' },
    { value: 8, label: '8+ and above' },
    { value: 9, label: '9+ and above' },
    { value: 10, label: '10 only' }
];

// Cache for artbridge quality scores
let qualityScores = {};

// ============================================
// INITIALIZATION
// ============================================

async function initializeStyleData() {
    console.log('Initializing Style Data from Supabase...');
    
    try {
        // Load lookup tables in parallel
        await loadLookupTables();
        
        // Load quality scores from artbridge
        await loadQualityScores();
        
        // Load initial styles (this also builds facet counts)
        await loadStyles();
        
        console.log(`Loaded ${allStyles.length} styles`);
        return true;
    } catch (error) {
        console.error('Failed to initialize style data:', error);
        return false;
    }
}

// ============================================
// QUALITY SCORES FROM ARTBRIDGE
// ============================================

async function loadQualityScores() {
    const { supabase } = window.SocietyArts;
    
    console.log('Loading quality scores from artbridge...');
    
    const { data, error } = await supabase
        .from('style_artbridge')
        .select('style_id, score');
    
    if (error) {
        console.error('Failed to load artbridge scores:', error);
        return;
    }
    
    // Calculate average score per style
    const scoresByStyle = {};
    (data || []).forEach(row => {
        if (!scoresByStyle[row.style_id]) {
            scoresByStyle[row.style_id] = [];
        }
        scoresByStyle[row.style_id].push(row.score);
    });
    
    // Compute averages
    qualityScores = {};
    Object.entries(scoresByStyle).forEach(([styleId, scores]) => {
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        qualityScores[styleId] = Math.round(avg * 100) / 100; // Round to 2 decimals
    });
    
    console.log(`Loaded quality scores for ${Object.keys(qualityScores).length} styles`);
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
// FACET COUNTS - Smart filtering like Amazon
// ============================================

async function buildFacetCounts(currentStyleIds = null) {
    const { supabase } = window.SocietyArts;
    
    facetCounts = {};
    
    // Get list of style IDs to count within
    let styleIdsToCount = currentStyleIds;
    
    // If no filter provided, get all active style IDs
    if (!styleIdsToCount) {
        const { data } = await supabase
            .from('styles')
            .select('id')
            .eq('is_active', true);
        styleIdsToCount = (data || []).map(s => s.id);
    }
    
    // For each junction table, count how many of the filtered styles have each option
    const countPromises = Object.entries(JUNCTION_TABLES).map(async ([filterKey, config]) => {
        const { data, error } = await supabase
            .from(config.table)
            .select(config.column)
            .in('style_id', styleIdsToCount);
        
        if (error) {
            console.warn(`Failed to count ${config.table}:`, error);
            return;
        }
        
        // Count occurrences of each value
        const counts = {};
        (data || []).forEach(row => {
            const id = row[config.column];
            counts[id] = (counts[id] || 0) + 1;
        });
        
        facetCounts[filterKey] = counts;
    });
    
    await Promise.all(countPromises);
    console.log('Facet counts built for', styleIdsToCount.length, 'styles');
    return facetCounts;
}

function getFacetCounts() {
    return facetCounts;
}

// ============================================
// STYLE LOADING WITH JUNCTION TABLE FILTERS
// ============================================

async function loadStyles(filters = {}) {
    const { supabase } = window.SocietyArts;
    isLoading = true;
    
    console.log('loadStyles called with filters:', filters);
    
    try {
        // Step 1: If we have filters, find matching style IDs from junction tables
        let matchingStyleIds = null;
        
        const filterKeys = Object.keys(filters).filter(k => filters[k] && k !== 'complexity');
        
        if (filterKeys.length > 0) {
            // For each active filter, get the style IDs that match
            const styleIdSets = await Promise.all(
                filterKeys.map(async (filterKey) => {
                    const config = JUNCTION_TABLES[filterKey];
                    if (!config) return null;
                    
                    const filterValue = filters[filterKey];
                    console.log(`Querying ${config.table} for ${config.column} = "${filterValue}"`);
                    
                    const { data, error } = await supabase
                        .from(config.table)
                        .select('style_id')
                        .eq(config.column, filterValue);
                    
                    if (error) {
                        console.error(`Junction query error for ${config.table}:`, error);
                        return new Set();
                    }
                    
                    const ids = (data || []).map(row => row.style_id);
                    console.log(`Found ${ids.length} styles with ${filterKey}="${filterValue}"`);
                    return new Set(ids);
                })
            );
            
            // Filter out null results
            const validSets = styleIdSets.filter(s => s !== null);
            
            if (validSets.length > 0) {
                // Intersect all sets - style must match ALL filters
                matchingStyleIds = [...validSets[0]];
                for (let i = 1; i < validSets.length; i++) {
                    matchingStyleIds = matchingStyleIds.filter(id => validSets[i].has(id));
                }
                console.log(`After intersection: ${matchingStyleIds.length} styles match all filters`);
            }
        }
        
        // Step 2: Query styles table
        let query = supabase
            .from('styles')
            .select(`
                id,
                name,
                tagline,
                description,
                thumbnail_url,
                complexity,
                best_format,
                best_size,
                audience_rating,
                is_featured,
                is_new,
                is_active,
                sref_code,
                created_at
            `)
            .eq('is_active', true)
            .not('name', 'is', null)
            .limit(5000);  // Get all styles (default is 1000)
        
        // Apply sorting (skip DB sort for quality_score since it's calculated)
        const sortConfig = SORT_OPTIONS[currentSort] || SORT_OPTIONS.quality;
        if (currentSort !== 'quality') {
            query = query.order(sortConfig.field, { ascending: sortConfig.direction === 'asc', nullsFirst: false });
            
            // Secondary sort by name for consistent ordering
            if (sortConfig.field !== 'name') {
                query = query.order('name', { ascending: true });
            }
        } else {
            // For quality sort, just order by name initially, we'll re-sort client-side
            query = query.order('name', { ascending: true });
        }
        
        // If we have matching IDs from junction tables, filter by them
        if (matchingStyleIds !== null) {
            if (matchingStyleIds.length === 0) {
                // No matches - return empty
                allStyles = [];
                filteredStyles = [];
                currentPage = 0;
                isLoading = false;
                return allStyles;
            }
            query = query.in('id', matchingStyleIds);
        }
        
        // Apply complexity filter (this IS on the styles table)
        if (filters.complexity) {
            query = query.eq('complexity', filters.complexity);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Supabase query error:', error);
            throw error;
        }
        
        console.log(`Query returned ${data?.length || 0} styles`);
        
        allStyles = (data || []).map(style => ({
            ...style,
            thumbnail: style.thumbnail_url || window.SocietyArts.getStyleImageUrl(style.id, 0),
            images: window.SocietyArts.getAllStyleImageUrls(style.id),
            quality_score: qualityScores[style.id] || 0
        }));
        
        // Apply quality score filter
        if (minQualityScore > 0) {
            allStyles = allStyles.filter(s => s.quality_score >= minQualityScore);
            console.log(`After quality filter (>=${minQualityScore}): ${allStyles.length} styles`);
        }
        
        // Sort client-side for quality_score (calculated field)
        const sortConfig = SORT_OPTIONS[currentSort] || SORT_OPTIONS.quality;
        if (sortConfig.field === 'quality_score') {
            if (sortConfig.direction === 'desc') {
                allStyles.sort((a, b) => b.quality_score - a.quality_score);
            } else {
                allStyles.sort((a, b) => a.quality_score - b.quality_score);
            }
        }
        
        // Re-apply search if there was one
        if (currentSearchTerm) {
            await searchStyles(currentSearchTerm);
        } else {
            filteredStyles = [...allStyles];
        }
        currentPage = 0;
        
        // Update facet counts based on current filtered results
        const filteredIds = filteredStyles.map(s => s.id);
        await buildFacetCounts(filteredIds);
        
        return allStyles;
    } catch (error) {
        console.error('Failed to load styles:', error);
        throw error;
    } finally {
        isLoading = false;
    }
}

// ============================================
// SMART SEARCH - searches across junction tables too
// ============================================

async function searchStyles(searchTerm) {
    currentSearchTerm = searchTerm;
    
    if (!searchTerm || searchTerm.trim() === '') {
        filteredStyles = [...allStyles];
        currentPage = 0;
        return filteredStyles;
    }
    
    const { supabase } = window.SocietyArts;
    
    // Split search into multiple terms (space-separated)
    const terms = searchTerm.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    
    // First, search in lookup tables to find matching IDs
    const matchingLookupIds = {};
    
    // Search art_types
    const artTypeMatches = lookupTables.art_types
        .filter(at => terms.some(term => at.name.toLowerCase().includes(term)))
        .map(at => at.id);
    if (artTypeMatches.length > 0) matchingLookupIds.art_types = artTypeMatches;
    
    // Search mediums
    const mediumMatches = lookupTables.mediums
        .filter(m => terms.some(term => m.name.toLowerCase().includes(term)))
        .map(m => m.id);
    if (mediumMatches.length > 0) matchingLookupIds.mediums = mediumMatches;
    
    // Search cultures
    const cultureMatches = lookupTables.cultures
        .filter(c => terms.some(term => c.name.toLowerCase().includes(term)))
        .map(c => c.id);
    if (cultureMatches.length > 0) matchingLookupIds.cultures = cultureMatches;
    
    // Search eras
    const eraMatches = lookupTables.eras
        .filter(e => terms.some(term => e.name.toLowerCase().includes(term)))
        .map(e => e.id);
    if (eraMatches.length > 0) matchingLookupIds.eras = eraMatches;
    
    // Search palettes
    const paletteMatches = lookupTables.palettes
        .filter(p => terms.some(term => p.name.toLowerCase().includes(term)))
        .map(p => p.id);
    if (paletteMatches.length > 0) matchingLookupIds.palettes = paletteMatches;
    
    // Get style IDs that match any of the lookup searches
    const styleIdsFromLookups = new Set();
    
    if (matchingLookupIds.art_types?.length) {
        const { data } = await supabase
            .from('style_art_types')
            .select('style_id')
            .in('art_type_id', matchingLookupIds.art_types);
        (data || []).forEach(row => styleIdsFromLookups.add(row.style_id));
    }
    
    if (matchingLookupIds.mediums?.length) {
        const { data } = await supabase
            .from('style_mediums')
            .select('style_id')
            .in('medium_id', matchingLookupIds.mediums);
        (data || []).forEach(row => styleIdsFromLookups.add(row.style_id));
    }
    
    if (matchingLookupIds.cultures?.length) {
        const { data } = await supabase
            .from('style_cultures')
            .select('style_id')
            .in('culture_id', matchingLookupIds.cultures);
        (data || []).forEach(row => styleIdsFromLookups.add(row.style_id));
    }
    
    if (matchingLookupIds.eras?.length) {
        const { data } = await supabase
            .from('style_eras')
            .select('style_id')
            .in('era_id', matchingLookupIds.eras);
        (data || []).forEach(row => styleIdsFromLookups.add(row.style_id));
    }
    
    if (matchingLookupIds.palettes?.length) {
        const { data } = await supabase
            .from('style_palettes')
            .select('style_id')
            .in('palette_id', matchingLookupIds.palettes);
        (data || []).forEach(row => styleIdsFromLookups.add(row.style_id));
    }
    
    // Now filter allStyles by both text match AND lookup matches
    filteredStyles = allStyles.filter(style => {
        // Check if style ID is in lookup matches
        if (styleIdsFromLookups.has(style.id)) {
            return true;
        }
        
        // Build searchable text from style's own fields
        const searchableText = [
            style.name,
            style.tagline,
            style.description,
            style.id,
            style.sref_code
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

async function setSort(sortKey) {
    if (!SORT_OPTIONS[sortKey]) {
        console.warn(`Invalid sort key: ${sortKey}`);
        return;
    }
    currentSort = sortKey;
    console.log('Sort changed to:', sortKey);
    await loadStyles(activeFilters);
    return filteredStyles;
}

async function setQualityThreshold(threshold) {
    minQualityScore = threshold;
    console.log('Quality threshold changed to:', threshold);
    await loadStyles(activeFilters);
    return filteredStyles;
}

function getQualityThreshold() {
    return minQualityScore;
}

function getQualityThresholds() {
    return QUALITY_THRESHOLDS;
}

function getCurrentSort() {
    return currentSort;
}

function getSortOptions() {
    return SORT_OPTIONS;
}

async function clearFilters() {
    activeFilters = {};
    currentSearchTerm = '';
    await loadStyles();
    await buildFacetCounts(); // Reset facet counts
    return filteredStyles;
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
// SINGLE STYLE RETRIEVAL WITH FULL DATA
// ============================================

async function getStyleById(styleId) {
    const { supabase } = window.SocietyArts;
    
    // Get basic style info
    const { data: style, error } = await supabase
        .from('styles')
        .select('*')
        .eq('id', styleId)
        .single();
    
    if (error) {
        console.error('Failed to get style:', error);
        return null;
    }
    
    // Get all related attributes from junction tables
    const [artTypes, mediums, cultures, eras, palettes, lighting, compositions] = await Promise.all([
        supabase.from('style_art_types').select('art_type_id').eq('style_id', styleId),
        supabase.from('style_mediums').select('medium_id').eq('style_id', styleId),
        supabase.from('style_cultures').select('culture_id').eq('style_id', styleId),
        supabase.from('style_eras').select('era_id').eq('style_id', styleId),
        supabase.from('style_palettes').select('palette_id').eq('style_id', styleId),
        supabase.from('style_lighting').select('lighting_id').eq('style_id', styleId),
        supabase.from('style_compositions').select('composition_id').eq('style_id', styleId)
    ]);
    
    // Map IDs to names
    const getNames = (data, lookupTable, idColumn) => {
        if (!data.data) return [];
        return data.data.map(row => {
            const item = lookupTables[lookupTable].find(l => l.id === row[idColumn]);
            return item?.name || row[idColumn];
        });
    };
    
    return {
        ...style,
        thumbnail: style.thumbnail_url || window.SocietyArts.getStyleImageUrl(styleId, 0),
        images: window.SocietyArts.getAllStyleImageUrls(styleId),
        // Related attributes as arrays of names
        artTypes: getNames(artTypes, 'art_types', 'art_type_id'),
        mediums: getNames(mediums, 'mediums', 'medium_id'),
        cultures: getNames(cultures, 'cultures', 'culture_id'),
        eras: getNames(eras, 'eras', 'era_id'),
        palettes: getNames(palettes, 'palettes', 'palette_id'),
        lighting: getNames(lighting, 'lighting', 'lighting_id'),
        compositions: getNames(compositions, 'compositions', 'composition_id')
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

// Get options with counts (for smart facets)
function getLookupOptionsWithCounts(tableName, filterKey) {
    const options = lookupTables[tableName] || [];
    const counts = facetCounts[filterKey] || {};
    
    return options
        .map(opt => ({
            ...opt,
            count: counts[opt.id] || 0
        }))
        .filter(opt => opt.count > 0) // Only show options with results
        .sort((a, b) => b.count - a.count); // Sort by count descending
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
// SAVED STYLES (localStorage)
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
// REPORT STYLE - Update Supabase flags
// ============================================

async function reportStyleForReview(styleId) {
    // Flag for image swap review - we'll add to a review queue
    // For now, still use Google Sheets but also track locally
    const sheetId = GOOGLE_SHEETS.swapImage;
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`;
    
    try {
        await navigator.clipboard.writeText(styleId);
        window.open(sheetUrl, '_blank');
        return {
            success: true,
            message: `Style ID "${styleId}" copied. Please paste in the Review spreadsheet.`
        };
    } catch (error) {
        console.error('Report for review failed:', error);
        return {
            success: false,
            message: 'Failed to report style. Please try again.'
        };
    }
}

async function unlistStyle(styleId) {
    const { supabase } = window.SocietyArts;
    
    try {
        const { error } = await supabase
            .from('styles')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', styleId);
        
        if (error) {
            console.error('Failed to unlist style:', error);
            return {
                success: false,
                message: `Failed to unlist style: ${error.message}`
            };
        }
        
        // Remove from local arrays
        allStyles = allStyles.filter(s => s.id !== styleId);
        filteredStyles = filteredStyles.filter(s => s.id !== styleId);
        
        return {
            success: true,
            message: `Style "${styleId}" has been unlisted and will no longer appear.`
        };
    } catch (error) {
        console.error('Unlist error:', error);
        return {
            success: false,
            message: 'Failed to unlist style. Please try again.'
        };
    }
}

// Legacy function for backward compatibility
async function reportStyle(styleId, reportType) {
    if (reportType === 'swap') {
        return reportStyleForReview(styleId);
    } else if (reportType === 'delete') {
        // This should be called after confirmation
        return { 
            success: false, 
            message: 'Use unlistStyle() after user confirmation' 
        };
    }
}

// ============================================
// DOWNLOAD IMAGE
// ============================================

async function downloadImage(imageUrl, filename) {
    try {
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
    
    // Facets
    buildFacetCounts,
    getFacetCounts,
    
    // Search & Filter
    searchStyles,
    applyFilters,
    clearFilters,
    activeFilters: () => activeFilters,
    
    // Sorting
    setSort,
    getCurrentSort,
    getSortOptions,
    SORT_OPTIONS,
    
    // Quality Score Filtering
    setQualityThreshold,
    getQualityThreshold,
    getQualityThresholds,
    QUALITY_THRESHOLDS,
    
    // Quality Scores
    getQualityScore: (styleId) => qualityScores[styleId] || 0,
    qualityScores: () => qualityScores,
    
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
    getLookupOptionsWithCounts,
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
    reportStyleForReview,
    unlistStyle,
    
    // Download
    downloadImage,
    
    // State
    allStyles: () => allStyles,
    filteredStyles: () => filteredStyles,
    isLoading: () => isLoading,
    STYLES_PER_PAGE
});
