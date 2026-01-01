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
      background: rgba(0, 0, 0, 0.6);
      z-index: 10000;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: 'Familjen Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .sdm-overlay.active {
      display: flex;
    }
    
    /* Modal Container - Two Column Layout */
    .sdm-content {
      background: white;
      border-radius: 20px;
      max-width: 1000px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      position: relative;
      display: grid;
      grid-template-columns: 320px 1fr;
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
    
    /* Left Panel - Info */
    .sdm-info {
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 500px;
    }
    
    .sdm-info-content {
      flex: 1;
    }
    
    /* Title - Dark Brown */
    .sdm-name {
      font-family: 'Domine', Georgia, serif;
      font-size: 2rem;
      font-weight: 600;
      font-style: italic;
      margin: 0 0 1.25rem 0;
      color: #3E2318;
      line-height: 1.2;
    }
    
    /* Description */
    .sdm-description {
      color: #5C5346;
      line-height: 1.7;
      margin: 0;
      font-size: 0.95rem;
    }
    
    /* Action Buttons - Bottom of Left Panel */
    .sdm-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 2rem;
    }
    
    .sdm-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 16px 24px;
      border-radius: 9999px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
      width: 100%;
    }
    
    .sdm-action-btn.primary {
      background: #C0715B;
      color: white;
      border: none;
    }
    
    .sdm-action-btn.primary:hover {
      background: #A65D4A;
    }
    
    .sdm-action-btn.secondary {
      background: white;
      color: #3E2318;
      border: 1.5px solid #D4CEC4;
    }
    
    .sdm-action-btn.secondary:hover {
      border-color: #B5AA9A;
      background: #FAF9F7;
    }
    
    /* Right Panel - Image Grid */
    .sdm-gallery-wrapper {
      position: relative;
      background: #FAF9F7;
      padding: 20px;
      overflow-y: auto;
      max-height: 90vh;
    }
    
    .sdm-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    
    .sdm-gallery img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .sdm-gallery img:hover {
      transform: scale(1.03);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    
    /* Style ID - Bottom Center of Gallery */
    .sdm-id {
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      color: #8B7B75;
      margin-top: 16px;
      letter-spacing: 0.5px;
    }
    
    /* Top Right Controls */
    .sdm-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
      z-index: 10;
    }
    
    .sdm-control-btn {
      width: 44px;
      height: 44px;
      border: none;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.15s ease;
      color: #8B7B75;
    }
    
    .sdm-control-btn:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      color: #3E2318;
    }
    
    .sdm-control-btn.favorite {
      color: #8B7B75;
    }
    
    .sdm-control-btn.favorite:hover {
      color: #dc2626;
    }
    
    .sdm-control-btn.favorite.active {
      color: #dc2626;
    }
    
    .sdm-control-btn.favorite.active svg {
      fill: #dc2626;
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
      grid-column: 1 / -1;
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
    @media (max-width: 900px) {
      .sdm-content {
        grid-template-columns: 1fr;
        max-height: 95vh;
      }
      
      .sdm-info {
        padding: 24px;
        min-height: auto;
      }
      
      .sdm-gallery-wrapper {
        max-height: 50vh;
      }
      
      .sdm-name {
        font-size: 1.5rem;
      }
      
      .sdm-controls {
        top: 12px;
        right: 12px;
      }
    }
    
    @media (max-width: 480px) {
      .sdm-overlay {
        padding: 0;
      }
      
      .sdm-content {
        border-radius: 0;
        max-height: 100vh;
      }
      
      .sdm-gallery {
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
    }
    
    /* Confirmation Modal */
    .sdm-confirm-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10002;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    
    .sdm-confirm-overlay.active {
      display: flex;
    }
    
    .sdm-confirm-modal {
      background: white;
      border-radius: 16px;
      max-width: 400px;
      width: 100%;
      padding: 32px;
      text-align: center;
      animation: sdmSlideUp 0.2s ease;
    }
    
    .sdm-confirm-icon {
      width: 48px;
      height: 48px;
      background: #FEF3F2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: #DC2626;
    }
    
    .sdm-confirm-title {
      font-family: 'Domine', Georgia, serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #3E2318;
      margin: 0 0 12px 0;
    }
    
    .sdm-confirm-message {
      color: #5C5346;
      line-height: 1.6;
      margin: 0 0 24px 0;
      font-size: 0.95rem;
    }
    
    .sdm-confirm-message strong {
      color: #3E2318;
    }
    
    .sdm-confirm-actions {
      display: flex;
      gap: 12px;
    }
    
    .sdm-confirm-btn {
      flex: 1;
      padding: 12px 20px;
      border-radius: 9999px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    
    .sdm-confirm-btn.cancel {
      background: white;
      color: #5C5346;
      border: 1.5px solid #D4CEC4;
    }
    
    .sdm-confirm-btn.cancel:hover {
      border-color: #B5AA9A;
      background: #FAF9F7;
    }
    
    .sdm-confirm-btn.remove {
      background: #DC2626;
      color: white;
      border: none;
    }
    
    .sdm-confirm-btn.remove:hover {
      background: #B91C1C;
    }
  `;

  // ==========================================
  // STATE
  // ==========================================
  
  let modalElement = null;
  let lightboxElement = null;
  let confirmElement = null;
  let stylesInjected = false;
  let currentStyleId = null;
  let currentStyle = null;
  let lightboxImages = [];
  let lightboxIndex = 0;
  let collectionContext = null; // { collectionId, collectionName }

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
    const svg = btn?.querySelector('svg');
    
    if (!btn) return;
    
    const user = getCurrentUser();
    if (!user) {
      btn.style.display = 'none';
      return;
    }
    
    btn.style.display = 'flex';
    const isFavorited = isStyleFavorited(currentStyleId);
    
    if (isFavorited) {
      btn.classList.add('active');
      if (svg) svg.setAttribute('fill', 'currentColor');
    } else {
      btn.classList.remove('active');
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
  
  function showRemoveConfirmation() {
    if (!collectionContext) return;
    
    const styleName = currentStyle?.name || currentStyleId;
    const collectionName = collectionContext.collectionName || 'this collection';
    
    const confirmHtml = `
      <div class="sdm-confirm-overlay active" id="sdmConfirmOverlay">
        <div class="sdm-confirm-modal">
          <div class="sdm-confirm-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </div>
          <h3 class="sdm-confirm-title">Remove from Collection?</h3>
          <p class="sdm-confirm-message">
            Are you sure you want to remove <strong>${escapeHtml(styleName)}</strong> from <strong>${escapeHtml(collectionName)}</strong>?
          </p>
          <div class="sdm-confirm-actions">
            <button class="sdm-confirm-btn cancel" id="sdmConfirmCancel">Cancel</button>
            <button class="sdm-confirm-btn remove" id="sdmConfirmRemove">Remove</button>
          </div>
        </div>
      </div>
    `;
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = confirmHtml;
    document.body.appendChild(wrapper.firstElementChild);
    confirmElement = document.getElementById('sdmConfirmOverlay');
    
    // Attach event listeners
    confirmElement.querySelector('#sdmConfirmCancel')?.addEventListener('click', hideRemoveConfirmation);
    confirmElement.querySelector('#sdmConfirmRemove')?.addEventListener('click', confirmRemoveFromCollection);
    confirmElement.addEventListener('click', (e) => {
      if (e.target.id === 'sdmConfirmOverlay') hideRemoveConfirmation();
    });
  }
  
  function hideRemoveConfirmation() {
    if (confirmElement) {
      confirmElement.remove();
      confirmElement = null;
    }
  }
  
  async function confirmRemoveFromCollection() {
    if (!collectionContext || !currentStyleId) return;
    
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase not available');
        return;
      }
      
      // Get current collection data
      const { data: collection, error: fetchError } = await supabase
        .from('user_collections')
        .select('styles')
        .eq('id', collectionContext.collectionId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Remove style from array
      const currentStyles = collection.styles || [];
      const updatedStyles = currentStyles.filter(id => id !== currentStyleId);
      
      // Update collection
      const { error: updateError } = await supabase
        .from('user_collections')
        .update({ styles: updatedStyles })
        .eq('id', collectionContext.collectionId);
      
      if (updateError) throw updateError;
      
      // Hide confirmation
      hideRemoveConfirmation();
      
      // Close the style detail modal
      closeModal();
      
      // Trigger a callback if provided (so collections page can refresh)
      if (collectionContext.onRemove) {
        collectionContext.onRemove(currentStyleId);
      }
      
    } catch (err) {
      console.error('Error removing style from collection:', err);
      hideRemoveConfirmation();
    }
  }

  // ==========================================
  // MODAL RENDERING
  // ==========================================
  
  function renderLoading() {
    return `
      <div class="sdm-overlay active" id="sdmOverlay">
        <div class="sdm-content">
          <div class="sdm-loading">
            <div class="sdm-spinner"></div>
            <span>Loading style...</span>
          </div>
        </div>
      </div>
    `;
  }
  
  function renderModal(style) {
    // Get images 1-9 (skip index 0 which is the thumbnail)
    const allImages = style.images || [];
    const images = allImages.slice(1, 10); // Images at indices 1-9
    
    const hasAddToCollection = !!window.SocietyArts?.openAddToCollectionModal;
    const inCollectionContext = !!collectionContext;
    
    return `
      <div class="sdm-overlay active" id="sdmOverlay">
        <div class="sdm-content">
          <!-- Left Panel - Info -->
          <div class="sdm-info">
            <div class="sdm-info-content">
              <h2 class="sdm-name">${escapeHtml(style.name) || 'Untitled Style'}</h2>
              <p class="sdm-description">${escapeHtml(style.description) || 'No description available.'}</p>
            </div>
            
            <div class="sdm-actions">
              <button class="sdm-action-btn primary sdm-project-btn">
                Add to Project
              </button>
              ${hasAddToCollection ? `
                <button class="sdm-action-btn secondary sdm-collection-btn">
                  Add to Collection
                </button>
              ` : ''}
              ${inCollectionContext ? `
                <button class="sdm-action-btn secondary sdm-remove-collection-btn">
                  Remove from Collection
                </button>
              ` : ''}
            </div>
          </div>
          
          <!-- Right Panel - Gallery -->
          <div class="sdm-gallery-wrapper">
            <!-- Top Right Controls -->
            <div class="sdm-controls">
              <button class="sdm-control-btn favorite sdm-favorite-btn" title="Favorite">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button class="sdm-control-btn sdm-close" title="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div class="sdm-gallery">
              ${images.map((url, i) => `
                <img src="${url}" alt="${escapeHtml(style.name)} - Image ${i + 1}" 
                     loading="lazy" 
                     data-index="${i}"
                     onerror="this.style.opacity='0.3'">
              `).join('')}
            </div>
            
            <div class="sdm-id">${escapeHtml(style.id)}</div>
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
    modalElement?.querySelector('.sdm-close')?.addEventListener('click', closeModal);
    
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
    modalElement?.querySelector('.sdm-remove-collection-btn')?.addEventListener('click', showRemoveConfirmation);
    
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
  
  async function openModal(styleId, context = null) {
    // Inject styles
    injectStyles();
    
    // Store state
    currentStyleId = styleId;
    collectionContext = context; // { collectionId, collectionName, onRemove }
    
    // Create loading modal
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderLoading();
    document.body.appendChild(wrapper.firstElementChild);
    modalElement = document.getElementById('sdmOverlay');
    
    // Attach close handler for loading state
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
      // Only use images 1-9 for the lightbox (same as displayed)
      lightboxImages = (style.images || []).slice(1, 10);
      
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
    if (confirmElement) {
      confirmElement.remove();
      confirmElement = null;
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove keyboard listener
    document.removeEventListener('keydown', handleKeydown);
    
    // Reset state
    currentStyleId = null;
    currentStyle = null;
    collectionContext = null;
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
