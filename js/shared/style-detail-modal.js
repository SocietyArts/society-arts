/* =====================================================
   SOCIETY ARTS - STYLE DETAIL MODAL
   Shared component for viewing style details
   
   Usage:
   1. Include this script in your page after supabase-client.js
   2. Call: SocietyArts.openStyleDetailModal(styleId)
   
   Dependencies:
   - supabase-client.js (window.SocietyArts.supabase)
   - style-data.js (window.SocietyArts.getStyleById, etc.)
   ===================================================== */

(function() {
  'use strict';

  // ==========================================
  // STYLES
  // ==========================================
  
  const modalStyles = `
    /* Style Detail Modal Overlay */
    .sdm-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: 'Familjen Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .sdm-overlay.active {
      display: flex;
    }
    
    /* Modal Container */
    .sdm-content {
      background: white;
      border-radius: 16px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: sdmSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes sdmSlideUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    /* Close Button */
    .sdm-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      color: #666;
      transition: all 0.15s ease;
    }
    
    .sdm-close:hover {
      background: white;
      color: #333;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    
    /* Image Gallery */
    .sdm-gallery {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;
      padding: 1.5rem;
      background: #f5f5f5;
    }
    
    .sdm-gallery img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .sdm-gallery img:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    /* Info Section */
    .sdm-info {
      padding: 1.5rem;
    }
    
    /* Title */
    .sdm-name {
      font-family: 'Domine', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #3E2318;
    }
    
    /* Tagline */
    .sdm-tagline {
      font-size: 1rem;
      color: #C73314;
      margin-bottom: 1rem;
      font-style: italic;
    }
    
    /* Description */
    .sdm-description {
      color: #8B7B75;
      line-height: 1.6;
      margin: 0 0 1rem 0;
    }
    
    /* Style ID */
    .sdm-id {
      font-size: 12px;
      font-weight: 600;
      color: #8B7B75;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1rem;
    }
    
    /* Action Buttons */
    .sdm-actions {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    
    .sdm-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 25px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #e5e5e5;
      background: white;
      font-family: inherit;
    }
    
    .sdm-action-btn:hover {
      background: #f5f5f5;
    }
    
    .sdm-action-btn.favorite {
      color: #dc2626;
    }
    
    .sdm-action-btn.favorite.active {
      background: #fee2e2;
      border-color: #fca5a5;
    }
    
    .sdm-action-btn.primary {
      background: #3D3530;
      color: white;
      border-color: #3D3530;
    }
    
    .sdm-action-btn.primary:hover {
      opacity: 0.9;
    }
    
    .sdm-action-btn.collection {
      color: #C0715B;
      border-color: #C0715B;
    }
    
    .sdm-action-btn.collection:hover {
      background: rgba(192, 113, 91, 0.1);
    }
    
    /* Tags Section */
    .sdm-tags-section {
      margin-bottom: 1.5rem;
    }
    
    .sdm-section-label {
      font-size: 11px;
      font-weight: 600;
      color: #8B7B75;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }
    
    .sdm-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .sdm-tag {
      background: #f5f5f5;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      color: #666;
    }
    
    /* Attributes Grid */
    .sdm-attributes {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .sdm-attribute {
      background: #f5f5f5;
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }
    
    .sdm-attribute-label {
      font-size: 0.75rem;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .sdm-attribute-value {
      font-weight: 500;
      color: #333;
    }
    
    /* Lightbox */
    .sdm-lightbox {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 10001;
      align-items: center;
      justify-content: center;
    }
    
    .sdm-lightbox.active {
      display: flex;
    }
    
    .sdm-lightbox-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 48px;
      height: 48px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      cursor: pointer;
      font-size: 2rem;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .sdm-lightbox-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .sdm-lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 48px;
      height: 48px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      cursor: pointer;
      font-size: 2rem;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .sdm-lightbox-nav:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .sdm-lightbox-prev {
      left: 1rem;
    }
    
    .sdm-lightbox-next {
      right: 1rem;
    }
    
    .sdm-lightbox-image {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
    }
    
    .sdm-lightbox-counter {
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 0.875rem;
    }
    
    /* Loading State */
    .sdm-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      color: #8B7B75;
    }
    
    .sdm-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #E7E2DC;
      border-top-color: #C0715B;
      border-radius: 50%;
      animation: sdmSpin 0.8s linear infinite;
      margin-right: 12px;
    }
    
    @keyframes sdmSpin {
      to { transform: rotate(360deg); }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .sdm-overlay {
        padding: 1rem;
      }
      
      .sdm-gallery {
        grid-template-columns: repeat(3, 1fr);
      }
      
      .sdm-name {
        font-size: 1.5rem;
      }
      
      .sdm-attributes {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 480px) {
      .sdm-gallery {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;

  // ==========================================
  // STATE
  // ==========================================
  
  let modalElement = null;
  let lightboxElement = null;
  let stylesInjected = false;
  let currentStyleId = null;
  let currentStyle = null;
  let lightboxImages = [];
  let lightboxIndex = 0;

  // ==========================================
  // HELPERS
  // ==========================================
  
  function getSupabase() {
    return window.SocietyArts?.supabase || window.supabaseClient || window.supabase;
  }
  
  function getCurrentUser() {
    return window.AuthState?.user || window.SocietyArts?.AuthState?.user;
  }
  
  function isStyleFavorited(styleId) {
    return window.SocietyArts?.isStyleFavorited?.(styleId) || false;
  }
  
  function injectStyles() {
    if (stylesInjected) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'sdm-styles';
    styleEl.textContent = modalStyles;
    document.head.appendChild(styleEl);
    stylesInjected = true;
  }
  
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================
  // LIGHTBOX
  // ==========================================
  
  function openLightbox(index) {
    lightboxIndex = index;
    updateLightbox();
    lightboxElement?.classList.add('active');
  }
  
  function closeLightbox() {
    lightboxElement?.classList.remove('active');
  }
  
  function prevLightbox() {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightbox();
  }
  
  function nextLightbox() {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    updateLightbox();
  }
  
  function updateLightbox() {
    const img = lightboxElement?.querySelector('.sdm-lightbox-image');
    const counter = lightboxElement?.querySelector('.sdm-lightbox-counter');
    if (img && lightboxImages[lightboxIndex]) {
      img.src = lightboxImages[lightboxIndex];
    }
    if (counter) {
      counter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    }
  }

  // ==========================================
  // ACTIONS
  // ==========================================
  
  async function toggleFavorite() {
    const user = getCurrentUser();
    if (!user) {
      if (window.openAuthModal) {
        window.openAuthModal();
      }
      return;
    }
    
    if (!currentStyleId) return;
    
    try {
      const isFavorited = isStyleFavorited(currentStyleId);
      
      if (isFavorited) {
        await window.SocietyArts?.removeFavorite?.(currentStyleId);
      } else {
        await window.SocietyArts?.addFavorite?.(currentStyleId, currentStyle?.name);
      }
      
      updateFavoriteButton();
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }
  
  function updateFavoriteButton() {
    const btn = modalElement?.querySelector('.sdm-favorite-btn');
    const text = btn?.querySelector('.sdm-favorite-text');
    const svg = btn?.querySelector('svg');
    
    if (!btn) return;
    
    const user = getCurrentUser();
    if (!user) {
      btn.style.display = 'none';
      return;
    }
    
    btn.style.display = 'inline-flex';
    const isFavorited = isStyleFavorited(currentStyleId);
    
    if (isFavorited) {
      btn.classList.add('active');
      if (text) text.textContent = 'Favorited';
      if (svg) svg.setAttribute('fill', 'currentColor');
    } else {
      btn.classList.remove('active');
      if (text) text.textContent = 'Favorite';
      if (svg) svg.setAttribute('fill', 'none');
    }
  }
  
  function addToProject() {
    const user = getCurrentUser();
    if (!user) {
      if (window.openAuthModal) {
        window.openAuthModal();
      }
      return;
    }
    
    // Try to use existing project functionality
    if (window.SocietyArts?.addStyleToProject) {
      window.SocietyArts.addStyleToProject(currentStyleId);
    } else if (window.addStyleToProject) {
      window.addStyleToProject(currentStyleId);
    } else {
      // Fallback: navigate to story-builder with style
      window.location.href = `/story-builder.html?style=${currentStyleId}`;
    }
  }
  
  function addToCollection() {
    // Use the shared add-to-collection modal if available
    if (window.SocietyArts?.openAddToCollectionModal) {
      window.SocietyArts.openAddToCollectionModal(currentStyleId, currentStyle?.name);
    }
  }

  // ==========================================
  // MODAL RENDERING
  // ==========================================
  
  function renderLoading() {
    return `
      <div class="sdm-overlay active" id="sdmOverlay">
        <div class="sdm-content">
          <button class="sdm-close" id="sdmClose">×</button>
          <div class="sdm-loading">
            <div class="sdm-spinner"></div>
            <span>Loading style...</span>
          </div>
        </div>
      </div>
    `;
  }
  
  function renderModal(style) {
    const images = style.images || [];
    const allTags = [
      ...(style.artTypes || []),
      ...(style.mediums || []),
      ...(style.cultures || []),
      ...(style.eras || []),
      ...(style.palettes || []),
      ...(style.lighting || []),
      ...(style.compositions || [])
    ];
    
    const attributes = [
      ['Art Types', style.artTypes?.join(', ')],
      ['Mediums', style.mediums?.join(', ')],
      ['Cultures', style.cultures?.join(', ')],
      ['Eras', style.eras?.join(', ')],
      ['Palettes', style.palettes?.join(', ')],
      ['Lighting', style.lighting?.join(', ')],
      ['Compositions', style.compositions?.join(', ')],
      ['Complexity', style.complexity ? `Level ${style.complexity}` : null],
      ['Best Format', style.best_format],
      ['Best Size', style.best_size]
    ].filter(([_, value]) => value);
    
    const hasAddToCollection = !!window.SocietyArts?.openAddToCollectionModal;
    
    return `
      <div class="sdm-overlay active" id="sdmOverlay">
        <div class="sdm-content">
          <button class="sdm-close" id="sdmClose">×</button>
          
          <div class="sdm-gallery">
            ${images.map((url, i) => `
              <img src="${url}" alt="${escapeHtml(style.name)} - Image ${i + 1}" 
                   loading="lazy" 
                   data-index="${i}"
                   onerror="this.style.display='none'">
            `).join('')}
          </div>
          
          <div class="sdm-info">
            <h2 class="sdm-name">${escapeHtml(style.name) || 'Untitled Style'}</h2>
            
            ${style.tagline ? `<div class="sdm-tagline">${escapeHtml(style.tagline)}</div>` : ''}
            
            <p class="sdm-description">${escapeHtml(style.description) || 'No description available.'}</p>
            
            <div class="sdm-id">Style #${escapeHtml(style.id)}</div>
            
            <div class="sdm-actions">
              <button class="sdm-action-btn favorite sdm-favorite-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span class="sdm-favorite-text">Favorite</span>
              </button>
              <button class="sdm-action-btn primary sdm-project-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add to Project
              </button>
              ${hasAddToCollection ? `
                <button class="sdm-action-btn collection sdm-collection-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Add to Collection
                </button>
              ` : ''}
            </div>
            
            ${allTags.length > 0 ? `
              <div class="sdm-tags-section">
                <div class="sdm-section-label">Tags</div>
                <div class="sdm-tags">
                  ${allTags.map(tag => `<span class="sdm-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            
            ${attributes.length > 0 ? `
              <div class="sdm-attributes">
                ${attributes.map(([label, value]) => `
                  <div class="sdm-attribute">
                    <div class="sdm-attribute-label">${escapeHtml(label)}</div>
                    <div class="sdm-attribute-value">${escapeHtml(value)}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
      
      <div class="sdm-lightbox" id="sdmLightbox">
        <button class="sdm-lightbox-close">×</button>
        <button class="sdm-lightbox-nav sdm-lightbox-prev">‹</button>
        <img class="sdm-lightbox-image" src="" alt="Zoomed style image">
        <button class="sdm-lightbox-nav sdm-lightbox-next">›</button>
        <div class="sdm-lightbox-counter">1 / ${images.length}</div>
      </div>
    `;
  }

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  
  function attachEventListeners() {
    // Close button
    modalElement?.querySelector('#sdmClose')?.addEventListener('click', closeModal);
    
    // Click overlay to close
    modalElement?.addEventListener('click', (e) => {
      if (e.target.id === 'sdmOverlay') closeModal();
    });
    
    // Gallery image clicks for lightbox
    modalElement?.querySelectorAll('.sdm-gallery img').forEach(img => {
      img.addEventListener('click', () => {
        const index = parseInt(img.dataset.index, 10);
        openLightbox(index);
      });
    });
    
    // Action buttons
    modalElement?.querySelector('.sdm-favorite-btn')?.addEventListener('click', toggleFavorite);
    modalElement?.querySelector('.sdm-project-btn')?.addEventListener('click', addToProject);
    modalElement?.querySelector('.sdm-collection-btn')?.addEventListener('click', addToCollection);
    
    // Lightbox controls
    lightboxElement = document.getElementById('sdmLightbox');
    lightboxElement?.querySelector('.sdm-lightbox-close')?.addEventListener('click', closeLightbox);
    lightboxElement?.querySelector('.sdm-lightbox-prev')?.addEventListener('click', prevLightbox);
    lightboxElement?.querySelector('.sdm-lightbox-next')?.addEventListener('click', nextLightbox);
    lightboxElement?.addEventListener('click', (e) => {
      if (e.target.classList.contains('sdm-lightbox')) closeLightbox();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);
  }
  
  function handleKeydown(e) {
    if (!modalElement) return;
    
    if (e.key === 'Escape') {
      if (lightboxElement?.classList.contains('active')) {
        closeLightbox();
      } else {
        closeModal();
      }
    }
    
    if (lightboxElement?.classList.contains('active')) {
      if (e.key === 'ArrowLeft') prevLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
    }
  }

  // ==========================================
  // MODAL LIFECYCLE
  // ==========================================
  
  async function openModal(styleId) {
    // Inject styles
    injectStyles();
    
    // Store state
    currentStyleId = styleId;
    
    // Create loading modal
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderLoading();
    document.body.appendChild(wrapper.firstElementChild);
    modalElement = document.getElementById('sdmOverlay');
    
    // Attach close handler for loading state
    modalElement?.querySelector('#sdmClose')?.addEventListener('click', closeModal);
    modalElement?.addEventListener('click', (e) => {
      if (e.target.id === 'sdmOverlay') closeModal();
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    try {
      // Load style data
      let style = null;
      
      if (window.SocietyArts?.getStyleById) {
        style = await window.SocietyArts.getStyleById(styleId);
      } else if (window.SocietyArts?.initializeStyleData) {
        await window.SocietyArts.initializeStyleData();
        style = await window.SocietyArts.getStyleById(styleId);
      }
      
      if (!style) {
        console.error('Style not found:', styleId);
        closeModal();
        return;
      }
      
      currentStyle = style;
      lightboxImages = style.images || [];
      
      // Replace loading with full modal
      modalElement.outerHTML = renderModal(style);
      modalElement = document.getElementById('sdmOverlay');
      
      // Attach event listeners
      attachEventListeners();
      
      // Update favorite button state
      updateFavoriteButton();
      
    } catch (err) {
      console.error('Error loading style:', err);
      closeModal();
    }
  }
  
  function closeModal() {
    if (modalElement) {
      modalElement.remove();
      modalElement = null;
    }
    if (lightboxElement) {
      lightboxElement.remove();
      lightboxElement = null;
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove keyboard listener
    document.removeEventListener('keydown', handleKeydown);
    
    // Reset state
    currentStyleId = null;
    currentStyle = null;
    lightboxImages = [];
    lightboxIndex = 0;
  }

  // ==========================================
  // PUBLIC API
  // ==========================================
  
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.openStyleDetailModal = openModal;
  window.SocietyArts.closeStyleDetailModal = closeModal;
  
  // Also expose as standalone function
  window.openStyleDetailModal = openModal;
  
  console.log('Style Detail Modal loaded');
  
})();
