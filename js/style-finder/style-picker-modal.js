/**
 * Style Picker Modal Component
 * Society Arts - Shared Style Finder
 * 
 * Usage:
 * - As modal in Story Builder: <StylePickerModal isOpen={true} mode="modal" onClose={fn} ... />
 * - As modal in Collections: <StylePickerModal isOpen={true} mode="modal" context="collection" ... />
 * - As standalone page: <StyleFinderPage />
 * 
 * Required: 
 * - /css/style-finder.css
 * - /js/style-finder/style-data.js (for image URL helpers)
 * - window.SocietyArts.supabase
 */

console.log('[StylePickerModal] Script starting...');

// Medium categories for faceted navigation - uses AMD codes from art_mediums table
const MEDIUM_CATEGORIES = {
  painting: {
    name: 'Painting',
    mediums: [
      { id: 'AMD001', name: 'Bold Paint (Oil/Acrylic)' },
      { id: 'AMD002', name: 'Fluid Paint (Watercolor)' },
      { id: 'AMD003', name: 'Flat Paint (Poster/Gouache)' }
    ]
  },
  drawing: {
    name: 'Drawing',
    mediums: [
      { id: 'AMD004', name: 'Sketch (Pencil/Graphite)' },
      { id: 'AMD005', name: 'Bold Line (Ink/Charcoal)' },
      { id: 'AMD006', name: 'Color Drawing (Pastel/Colored Pencil)' }
    ]
  },
  photography: {
    name: 'Photography',
    mediums: [
      { id: 'AMD007', name: 'Color Photography' },
      { id: 'AMD008', name: 'Black & White Photography' }
    ]
  },
  printmaking: {
    name: 'Printmaking',
    mediums: [
      { id: 'AMD009', name: 'Bold Carved Print (Woodcut/Linocut)' },
      { id: 'AMD010', name: 'Fine Line Print (Etching/Engraving)' },
      { id: 'AMD011', name: 'Poster Print (Screenprint)' }
    ]
  },
  collage: {
    name: 'Collage / Mixed Media',
    mediums: [
      { id: 'AMD012', name: 'Paper Collage' },
      { id: 'AMD013', name: 'Photo Collage' },
      { id: 'AMD014', name: 'Mixed Layers' }
    ]
  }
};

// Overlay styles (for future use)
const OVERLAYS = [
  { id: 'abstract', name: 'Abstract' },
  { id: 'realistic', name: 'Realistic' },
  { id: 'cinematic', name: 'Cinematic' },
  { id: 'experimental', name: 'Experimental' },
  { id: 'minimalist', name: 'Minimalist' },
  { id: 'whimsical', name: 'Whimsical' },
  { id: 'illustration', name: 'Illustration' },
  { id: 'historic', name: 'Historic' }
];

// Helper to safely get Supabase client
const getSupabase = () => {
  return window.SocietyArts?.supabase || window.supabaseClient || window.supabase;
};

// Helper to safely get style thumbnail URL
const getStyleThumbnailUrl = (styleId, index = 0) => {
  if (window.SocietyArts?.getStyleThumbnailUrl) {
    return window.SocietyArts.getStyleThumbnailUrl(styleId, index);
  }
  // Fallback
  const paddedIndex = String(index).padStart(2, '0');
  return `https://pub-acb560f551f141db830964aed1fa005f.r2.dev/${styleId}/${styleId}-${paddedIndex}.webp`;
};

// Helper to safely get style preview URL
const getStylePreviewUrl = (styleId, index) => {
  if (window.SocietyArts?.getStylePreviewUrl) {
    return window.SocietyArts.getStylePreviewUrl(styleId, index);
  }
  // Fallback
  const paddedIndex = String(index).padStart(2, '0');
  return `https://pub-acb560f551f141db830964aed1fa005f.r2.dev/${styleId}/${styleId}-${paddedIndex}.webp`;
};

// Helper to safely get style full URL
const getStyleFullUrl = (styleId, index) => {
  if (window.SocietyArts?.getStyleFullUrl) {
    return window.SocietyArts.getStyleFullUrl(styleId, index);
  }
  // Fallback
  const paddedIndex = String(index).padStart(2, '0');
  return `https://pub-acb560f551f141db830964aed1fa005f.r2.dev/${styleId}/${styleId}-${paddedIndex}.webp`;
};

/**
 * StylePickerModal - The core style finder component
 * 
 * Props:
 * @param {boolean} isOpen - Whether the modal is open (only used in modal mode)
 * @param {function} onClose - Callback when modal closes
 * @param {string[]} selectedStyles - Array of currently selected style IDs
 * @param {function} onStylesChange - Callback with new selection array
 * @param {number} maxStyles - Maximum number of styles that can be selected (default: 4)
 * @param {string} mode - 'modal' (default) or 'standalone'
 * @param {string} context - 'project' (default), 'collection', or 'browse'
 * @param {function} onAddToCollection - Callback when adding to collection (context='collection')
 * @param {function} onStartProject - Callback when starting new project (context='browse')
 */
function StylePickerModal({ 
  isOpen = true, 
  onClose, 
  selectedStyles = [], 
  onStylesChange,
  maxStyles = 4,
  mode = 'modal',
  context = 'project',
  onAddToCollection,
  onStartProject
}) {
  const { useState, useRef, useEffect, useCallback } = React;
  
  // Core state
  const [allStyles, setAllStyles] = useState([]);
  const [filteredStyles, setFilteredStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMediums, setSelectedMediums] = useState(new Set());
  const [selectedOverlays, setSelectedOverlays] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set(['painting', 'drawing']));
  const [activeTab, setActiveTab] = useState('browse');
  const [tempSelected, setTempSelected] = useState(new Set(selectedStyles));
  
  // Enhanced states
  const [isMaximized, setIsMaximized] = useState(() => {
    try {
      return localStorage.getItem('stylePickerMaximized') === 'true';
    } catch {
      return false;
    }
  });
  const [gridDensity, setGridDensity] = useState(() => {
    try {
      return parseInt(localStorage.getItem('stylePickerDensity')) || 3;
    } catch {
      return 3;
    }
  });
  const [favorites, setFavorites] = useState(new Set());
  const [detailStyle, setDetailStyle] = useState(null);
  const [viewerImage, setViewerImage] = useState(null);
  const [openKebab, setOpenKebab] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Load styles on mount
  useEffect(() => {
    if (isOpen || mode === 'standalone') {
      loadStyles();
      loadFavorites();
      checkSuperAdmin();
      setTempSelected(new Set(selectedStyles));
    }
  }, [isOpen, selectedStyles, mode]);

  // Filter styles when search/filters change
  useEffect(() => {
    filterStyles();
  }, [searchTerm, selectedMediums, selectedOverlays, allStyles]);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('stylePickerMaximized', isMaximized);
    } catch (e) {
      console.warn('Could not save maximized preference:', e);
    }
  }, [isMaximized]);

  useEffect(() => {
    try {
      localStorage.setItem('stylePickerDensity', gridDensity);
    } catch (e) {
      console.warn('Could not save density preference:', e);
    }
  }, [gridDensity]);

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openKebab && !e.target.closest('.sp-kebab-menu') && !e.target.closest('.sp-card-kebab')) {
        setOpenKebab(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openKebab]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (viewerImage) {
          setViewerImage(null);
        } else if (detailStyle) {
          setDetailStyle(null);
        } else if (mode === 'modal') {
          if (isMaximized) {
            setIsMaximized(false);
          } else if (isOpen && onClose) {
            onClose();
          }
        }
      }
      // Image viewer navigation
      if (viewerImage) {
        if (e.key === 'ArrowLeft') {
          navigateImage(-1);
        } else if (e.key === 'ArrowRight') {
          navigateImage(1);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewerImage, detailStyle, isMaximized, isOpen, mode, onClose]);

  const checkSuperAdmin = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsSuperAdmin(profile?.role === 'superadmin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_favorites')
          .select('style_id')
          .eq('user_id', user.id);
        if (data) {
          setFavorites(new Set(data.map(f => f.style_id)));
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (styleId, e) => {
    if (e) e.stopPropagation();
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newFavorites = new Set(favorites);
      if (favorites.has(styleId)) {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('style_id', styleId);
        newFavorites.delete(styleId);
      } else {
        await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, style_id: styleId });
        newFavorites.add(styleId);
      }
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleHeaderDoubleClick = (e) => {
    if (e.target.closest('.style-picker-close') || e.target.closest('.sp-maximize-btn')) return;
    toggleMaximize();
  };

  const openStyleDetail = async (style, e) => {
    if (e) e.stopPropagation();
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data } = await supabase
          .from('styles')
          .select('*')
          .eq('id', style.id)
          .single();
        setDetailStyle(data || style);
      } else {
        setDetailStyle(style);
      }
    } catch (error) {
      setDetailStyle(style);
    }
    setOpenKebab(null);
  };

  const navigateImage = (direction) => {
    if (!viewerImage) return;
    let newIndex = viewerImage.imageIndex + direction;
    if (newIndex < 1) newIndex = 9;
    if (newIndex > 9) newIndex = 1;
    setViewerImage({ ...viewerImage, imageIndex: newIndex });
  };

  const handleKebabClick = (styleId, e) => {
    e.stopPropagation();
    setOpenKebab(openKebab === styleId ? null : styleId);
  };

  const handleAddToProject = (styleId, e) => {
    if (e) e.stopPropagation();
    toggleStyleSelection(styleId);
    setOpenKebab(null);
    if (detailStyle) setDetailStyle(null);
  };

  const handleAddToCollectionClick = (styleId, e) => {
    if (e) e.stopPropagation();
    if (onAddToCollection) {
      onAddToCollection(styleId);
    }
    setOpenKebab(null);
  };

  const handleStartProjectClick = (styleId, e) => {
    if (e) e.stopPropagation();
    if (onStartProject) {
      onStartProject(styleId);
    }
    setOpenKebab(null);
    if (detailStyle) setDetailStyle(null);
  };

  const handleFlagForReview = async (styleId) => {
    console.log('Flag for review:', styleId);
    setOpenKebab(null);
  };

  const handleUnlist = async (styleId) => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      
      await supabase
        .from('styles')
        .update({ is_active: false })
        .eq('id', styleId);
      setAllStyles(allStyles.filter(s => s.id !== styleId));
      setFilteredStyles(filteredStyles.filter(s => s.id !== styleId));
      setDetailStyle(null);
      setOpenKebab(null);
    } catch (error) {
      console.error('Error unlisting style:', error);
    }
  };

  const handleEdit = (styleId) => {
    console.log('Edit style:', styleId);
    setOpenKebab(null);
  };

  const loadStyles = async () => {
    setLoading(true);
    setLoadError(null);
    
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      const { data: stylesData, error } = await supabase
        .from('styles')
        .select('id, name, thumbnail_url, market_viability_score')
        .eq('is_active', true)
        .order('market_viability_score', { ascending: false, nullsFirst: false })
        .order('name', { ascending: true })
        .limit(5000);
      
      if (error) throw error;

      const { data: artMediumLinks } = await supabase
        .from('style_art_mediums')
        .select('style_id, art_medium_id');

      const artMediumMap = {};
      if (artMediumLinks && artMediumLinks.length > 0) {
        artMediumLinks.forEach(link => {
          if (!artMediumMap[link.style_id]) {
            artMediumMap[link.style_id] = [];
          }
          artMediumMap[link.style_id].push(link.art_medium_id);
        });
      }

      const stylesWithAttrs = stylesData.map(s => ({
        ...s,
        art_medium_ids: artMediumMap[s.id] || []
      }));

      setAllStyles(stylesWithAttrs);
      setFilteredStyles(stylesWithAttrs);
    } catch (error) {
      console.error('Error loading styles:', error);
      setLoadError(error.message || 'Failed to load styles');
    }
    setLoading(false);
  };

  const filterStyles = () => {
    let results = [...allStyles];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(s => 
        s.name?.toLowerCase().includes(term) ||
        s.id?.toLowerCase().includes(term)
      );
    }

    if (selectedMediums.size > 0) {
      results = results.filter(s => {
        return s.art_medium_ids?.some(amId => selectedMediums.has(amId));
      });
    }

    if (selectedOverlays.size > 0) {
      results = results.filter(s => selectedOverlays.has(s.overlay));
    }

    setFilteredStyles(results);
  };

  const toggleMedium = (mediumId) => {
    const newSet = new Set(selectedMediums);
    if (newSet.has(mediumId)) {
      newSet.delete(mediumId);
    } else {
      newSet.add(mediumId);
    }
    setSelectedMediums(newSet);
  };

  const toggleOverlay = (overlayId) => {
    const newSet = new Set(selectedOverlays);
    if (newSet.has(overlayId)) {
      newSet.delete(overlayId);
    } else {
      newSet.add(overlayId);
    }
    setSelectedOverlays(newSet);
  };

  const toggleCategory = (catId) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(catId)) {
      newSet.delete(catId);
    } else {
      newSet.add(catId);
    }
    setExpandedCategories(newSet);
  };

  const toggleStyleSelection = (styleId) => {
    const newSet = new Set(tempSelected);
    if (newSet.has(styleId)) {
      newSet.delete(styleId);
    } else if (newSet.size < maxStyles) {
      newSet.add(styleId);
    }
    setTempSelected(newSet);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMediums(new Set());
    setSelectedOverlays(new Set());
  };

  const handleDone = () => {
    if (onStylesChange) {
      onStylesChange(Array.from(tempSelected));
    }
    if (onClose) {
      onClose();
    }
  };

  const getStyleImage = (style) => {
    if (style.thumbnail_url) {
      return style.thumbnail_url;
    }
    return getStyleThumbnailUrl(style.id, 0);
  };

  // Don't render if modal mode and not open
  if (mode === 'modal' && !isOpen) return null;

  // Determine what title to show based on context
  const getTitle = () => {
    switch (context) {
      case 'collection': return 'Add Styles to Collection';
      case 'browse': return 'Explore Art Styles';
      default: return 'Choose Your Styles';
    }
  };

  // Determine primary action label based on context
  const getPrimaryActionLabel = (styleId) => {
    if (context === 'collection') {
      return 'Add to Collection';
    }
    if (context === 'browse') {
      return 'Start a Project';
    }
    return tempSelected.has(styleId) ? '− Remove from Project' : '+ Add to Project';
  };

  // Modal content (shared between modal and standalone modes)
  const renderContent = () => (
    <div className={`style-picker-modal ${isMaximized ? 'maximized' : ''}`}>
      {/* Header */}
      <div className="style-picker-header" onDoubleClick={handleHeaderDoubleClick}>
        <span className="style-picker-title">{getTitle()}</span>
        <div className="style-picker-header-actions">
          {mode === 'modal' && (
            <>
              <button className="sp-maximize-btn" onClick={toggleMaximize} title={isMaximized ? 'Restore' : 'Maximize'}>
                {isMaximized ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 14 10 14 10 20"></polyline>
                    <polyline points="20 10 14 10 14 4"></polyline>
                    <line x1="14" y1="10" x2="21" y2="3"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                )}
              </button>
              <button className="style-picker-close" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="style-picker-tabs">
        <button 
          className={`style-picker-tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse All
        </button>
        <button className="style-picker-tab coming-soon" disabled>
          AI Match
        </button>
        <button className="style-picker-tab coming-soon" disabled>
          By Mood
        </button>
        <button className="style-picker-tab coming-soon" disabled>
          By Color
        </button>
      </div>

      {/* Body */}
      <div className="style-picker-body">
        {/* Sidebar */}
        <div className="style-picker-sidebar">
          <div className="sp-search">
            <div className="sp-search-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search styles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="sp-facets">
            {Object.entries(MEDIUM_CATEGORIES).map(([catId, category]) => (
              <div key={catId} className={`sp-category ${expandedCategories.has(catId) ? 'open' : ''}`}>
                <div className="sp-category-header" onClick={() => toggleCategory(catId)}>
                  <div className="sp-category-header-left">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <h4>{category.name}</h4>
                  </div>
                  <span className="sp-category-count">
                    {category.mediums.reduce((sum, m) => {
                      const count = allStyles.filter(s => s.art_medium_ids?.includes(m.id)).length;
                      return sum + count;
                    }, 0)}
                  </span>
                </div>
                <div className="sp-category-items">
                  {category.mediums.map(medium => (
                    <div 
                      key={medium.id}
                      className={`sp-facet-item ${selectedMediums.has(medium.id) ? 'selected' : ''}`}
                      onClick={() => toggleMedium(medium.id)}
                    >
                      <div className="sp-facet-checkbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span>{medium.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className={`sp-category ${expandedCategories.has('overlays') ? 'open' : ''}`}>
              <div className="sp-category-header" onClick={() => toggleCategory('overlays')}>
                <div className="sp-category-header-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <h4>Style</h4>
                </div>
                <span className="sp-category-count">{OVERLAYS.length}</span>
              </div>
              <div className="sp-category-items">
                {OVERLAYS.map(overlay => (
                  <div 
                    key={overlay.id}
                    className={`sp-facet-item ${selectedOverlays.has(overlay.id) ? 'selected' : ''}`}
                    onClick={() => toggleOverlay(overlay.id)}
                  >
                    <div className="sp-facet-checkbox">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>{overlay.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid Area */}
        <div className="style-picker-grid-area">
          <div className="sp-grid-header">
            <span className="sp-results-count">
              {filteredStyles.length} styles {(selectedMediums.size > 0 || selectedOverlays.size > 0 || searchTerm) && '(filtered)'}
            </span>
            <div className="sp-grid-controls">
              {(selectedMediums.size > 0 || selectedOverlays.size > 0 || searchTerm) && (
                <button className="sp-reset-btn" onClick={resetFilters}>Reset filters</button>
              )}
              <div className="sp-density-selector">
                <button 
                  className={`sp-density-btn ${gridDensity === 2 ? 'active' : ''}`}
                  onClick={() => setGridDensity(2)}
                  title="2 columns"
                >
                  <span className="density-dot"></span>
                  <span className="density-dot"></span>
                </button>
                <button 
                  className={`sp-density-btn ${gridDensity === 3 ? 'active' : ''}`}
                  onClick={() => setGridDensity(3)}
                  title="3 columns"
                >
                  <span className="density-dot"></span>
                  <span className="density-dot"></span>
                  <span className="density-dot"></span>
                </button>
                <button 
                  className={`sp-density-btn ${gridDensity === 4 ? 'active' : ''}`}
                  onClick={() => setGridDensity(4)}
                  title="4 columns"
                >
                  <span className="density-dot"></span>
                  <span className="density-dot"></span>
                  <span className="density-dot"></span>
                  <span className="density-dot"></span>
                </button>
              </div>
            </div>
          </div>

          <div className={`sp-grid density-${gridDensity}`}>
            {loading ? (
              <div className="sp-loading">
                <div className="sp-spinner"></div>
              </div>
            ) : loadError ? (
              <div className="sp-error">
                <p>Error: {loadError}</p>
                <button onClick={loadStyles}>Try Again</button>
              </div>
            ) : (
              filteredStyles.map(style => (
                <div 
                  key={style.id}
                  className={`sp-card ${tempSelected.has(style.id) ? 'selected' : ''}`}
                >
                  {/* Checkbox */}
                  {context === 'project' && (
                    <div 
                      className={`sp-card-checkbox ${tempSelected.has(style.id) ? 'checked' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleStyleSelection(style.id); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}

                  {/* Heart */}
                  <button 
                    className={`sp-card-heart ${favorites.has(style.id) ? 'favorited' : ''}`}
                    onClick={(e) => toggleFavorite(style.id, e)}
                  >
                    <svg viewBox="0 0 24 24" fill={favorites.has(style.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>

                  {/* Image Zone */}
                  <div className="sp-card-image-zone" onClick={() => openStyleDetail(style)}>
                    <img 
                      src={getStyleImage(style)} 
                      alt={style.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = getStyleThumbnailUrl(style.id, 0);
                      }}
                    />
                  </div>
                  <img 
                    src={getStyleImage(style)} 
                    alt={style.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = getStyleThumbnailUrl(style.id, 0);
                    }}
                  />

                  {/* Kebab Menu */}
                  <button 
                    className="sp-card-kebab"
                    onClick={(e) => handleKebabClick(style.id, e)}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.5"></circle>
                      <circle cx="12" cy="12" r="1.5"></circle>
                      <circle cx="12" cy="19" r="1.5"></circle>
                    </svg>
                  </button>

                  {openKebab === style.id && (
                    <div className="sp-kebab-menu" onClick={(e) => e.stopPropagation()}>
                      <div className="sp-kebab-menu-header">{style.name}</div>
                      {context === 'project' && (
                        <button className="sp-kebab-menu-item" onClick={(e) => handleAddToProject(style.id, e)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {tempSelected.has(style.id) ? (
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            ) : (
                              <><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></>
                            )}
                          </svg>
                          {tempSelected.has(style.id) ? 'Remove from Project' : 'Add to Project'}
                        </button>
                      )}
                      {context === 'browse' && (
                        <button className="sp-kebab-menu-item" onClick={(e) => handleStartProjectClick(style.id, e)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Start a Project
                        </button>
                      )}
                      <button className="sp-kebab-menu-item" onClick={(e) => handleAddToCollectionClick(style.id, e)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Add to Collection
                      </button>
                      {isSuperAdmin && (
                        <>
                          <div className="sp-kebab-menu-divider"></div>
                          <button className="sp-kebab-menu-item" onClick={() => handleFlagForReview(style.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                              <line x1="4" y1="22" x2="4" y2="15"></line>
                            </svg>
                            Flag for Review
                          </button>
                          <button className="sp-kebab-menu-item danger" onClick={() => handleUnlist(style.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                            </svg>
                            Unlist
                          </button>
                          <button className="sp-kebab-menu-item" onClick={() => handleEdit(style.id)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {context === 'project' && (
        <div className="style-picker-footer">
          <div className="sp-selection-info">
            <span className="sp-selection-count">
              <strong>{tempSelected.size}</strong> of {maxStyles} styles selected
            </span>
            {tempSelected.size > 0 && (
              <div className="sp-selected-previews">
                {Array.from(tempSelected).slice(0, 4).map(styleId => {
                  const style = allStyles.find(s => s.id === styleId);
                  return style ? (
                    <div key={styleId} className="sp-selected-preview">
                      <img src={getStyleImage(style)} alt={style.name} />
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <div className="sp-footer-actions">
            {mode === 'modal' && (
              <button className="sp-cancel-btn" onClick={onClose}>Cancel</button>
            )}
            <button className="sp-done-btn" onClick={handleDone}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Style Detail Overlay */}
      {detailStyle && (
        <div className="style-detail-overlay" onClick={(e) => e.target === e.currentTarget && setDetailStyle(null)}>
          <div className="style-detail-modal">
            <div className="style-detail-floating-btns">
              <button 
                className={`style-detail-floating-btn heart ${favorites.has(detailStyle.id) ? 'favorited' : ''}`}
                onClick={(e) => toggleFavorite(detailStyle.id, e)}
                title="Add to favorites"
              >
                <svg viewBox="0 0 24 24" fill={favorites.has(detailStyle.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button 
                className="style-detail-floating-btn"
                onClick={() => setDetailStyle(null)}
                title="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="style-detail-content">
              <div className="style-detail-info">
                <h2 className="style-detail-name">{detailStyle.name}</h2>
                <p className="style-detail-description">
                  {detailStyle.description || 'No description available for this style.'}
                </p>

                <div className="style-detail-actions">
                  {context === 'project' && (
                    <button 
                      className={`style-detail-btn-primary ${tempSelected.has(detailStyle.id) ? 'remove' : ''}`}
                      onClick={() => handleAddToProject(detailStyle.id)}
                    >
                      {getPrimaryActionLabel(detailStyle.id)}
                    </button>
                  )}
                  {context === 'browse' && (
                    <button 
                      className="style-detail-btn-primary"
                      onClick={() => handleStartProjectClick(detailStyle.id)}
                    >
                      Start a Project
                    </button>
                  )}
                  <button 
                    className="style-detail-btn-secondary"
                    onClick={() => handleAddToCollectionClick(detailStyle.id)}
                  >
                    Add to Collection
                  </button>
                  
                  {isSuperAdmin && (
                    <div className="style-detail-admin">
                      <div className="style-detail-admin-buttons">
                        <button className="style-detail-admin-btn" onClick={() => handleFlagForReview(detailStyle.id)}>
                          Flag for Review
                        </button>
                        <button className="style-detail-admin-btn danger" onClick={() => handleUnlist(detailStyle.id)}>
                          Unlist
                        </button>
                        <button className="style-detail-admin-btn" onClick={() => handleEdit(detailStyle.id)}>
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="style-detail-images">
                <div className="style-detail-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <div 
                      key={num}
                      className="style-detail-grid-item"
                      onClick={() => setViewerImage({ styleId: detailStyle.id, imageIndex: num })}
                    >
                      <img 
                        src={getStylePreviewUrl(detailStyle.id, num)}
                        alt={`${detailStyle.name} - Image ${num}`}
                        onError={(e) => { e.target.style.opacity = '0.3'; }}
                      />
                    </div>
                  ))}
                </div>
                <div className="style-detail-grid-id">{detailStyle.id}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Lightbox */}
      {viewerImage && (
        <div className="image-viewer-overlay" onClick={(e) => e.target === e.currentTarget && setViewerImage(null)}>
          <button className="image-viewer-close" onClick={() => setViewerImage(null)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div className="image-viewer-main">
            <button className="image-viewer-nav prev" onClick={() => navigateImage(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <div className="image-viewer-container">
              <img 
                src={getStyleFullUrl(viewerImage.styleId, viewerImage.imageIndex)}
                alt={`Image ${viewerImage.imageIndex}`}
                draggable={false}
              />
            </div>
            
            <button className="image-viewer-nav next" onClick={() => navigateImage(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          
          <div className="image-viewer-footer">
            <div className="image-viewer-dots">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num}
                  className={`image-viewer-dot ${viewerImage.imageIndex === num ? 'active' : ''}`}
                  onClick={() => setViewerImage({ ...viewerImage, imageIndex: num })}
                />
              ))}
            </div>
            <span className="image-viewer-counter">{viewerImage.imageIndex} of 9</span>
          </div>
        </div>
      )}
    </div>
  );

  // Render based on mode
  if (mode === 'standalone') {
    return (
      <div className="style-finder-page">
        {renderContent()}
      </div>
    );
  }

  // Modal mode - wrap in overlay
  return (
    <div className="style-picker-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {renderContent()}
    </div>
  );
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.StylePickerModal = StylePickerModal;
  window.SocietyArts.MEDIUM_CATEGORIES = MEDIUM_CATEGORIES;
  window.SocietyArts.OVERLAYS = OVERLAYS;
  console.log('✅ [StylePickerModal] Component registered successfully');
}
