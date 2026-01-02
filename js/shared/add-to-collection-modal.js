/**
 * Add to Collection Modal Component
 * Society Arts - Shared Component
 * 
 * Usage:
 * window.SocietyArts.openAddToCollectionModal(styleId, styleName)
 * 
 * This modal:
 * - Fetches user's existing collections
 * - Shows a list to pick from
 * - Allows creating a new collection inline
 * - Adds the style to the selected collection
 */

(function() {
  'use strict';
  
  console.log('[AddToCollectionModal] Initializing...');
  
  // Ensure namespace exists
  window.SocietyArts = window.SocietyArts || {};
  
  // Default color palette for new collections
  const DEFAULT_PALETTE = [
    { id: 1, name: "Coral", hex: "#E07A5F", text: "light" },
    { id: 2, name: "Sage", hex: "#81B29A", text: "light" },
    { id: 3, name: "Ocean", hex: "#3D5A80", text: "light" },
    { id: 4, name: "Sunset", hex: "#F2994A", text: "dark" },
    { id: 5, name: "Plum", hex: "#9B5DE5", text: "light" },
    { id: 6, name: "Gold", hex: "#D4A853", text: "dark" },
    { id: 7, name: "Rose", hex: "#C97B84", text: "light" },
    { id: 8, name: "Forest", hex: "#588157", text: "light" },
    { id: 9, name: "Slate", hex: "#5C677D", text: "light" },
    { id: 10, name: "Peach", hex: "#FFBE98", text: "dark" },
    { id: 11, name: "Indigo", hex: "#5E60CE", text: "light" },
    { id: 12, name: "Copper", hex: "#B87333", text: "light" }
  ];
  
  // Helper to get Supabase client
  const getSupabase = () => {
    return window.SocietyArts?.supabase || window.supabaseClient || window.supabase;
  };
  
  // Get style thumbnail URL
  const getStyleThumbnail = (styleId) => {
    if (window.SocietyArts?.getStyleThumbnailUrl) {
      return window.SocietyArts.getStyleThumbnailUrl(styleId, 0);
    }
    return `https://pub-acb560f551f141db830964aed1fa005f.r2.dev/${styleId}/${styleId}-00.webp`;
  };
  
  // CSS Styles for the modal
  const styles = `
    .atc-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: atcFadeIn 0.2s ease;
    }
    
    @keyframes atcFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .atc-modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      max-height: 80vh;
      margin: 16px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
      animation: atcSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    @keyframes atcSlideUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .atc-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e5e5;
      flex-shrink: 0;
    }
    
    .atc-modal-title {
      font-family: var(--font-serif, 'Domine', Georgia, serif);
      font-size: 20px;
      font-weight: 600;
      color: #3E2318;
      margin: 0;
    }
    
    .atc-close-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      transition: all 0.15s ease;
    }
    
    .atc-close-btn:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #333;
    }
    
    .atc-modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }
    
    /* Style Preview */
    .atc-style-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: #FAF9F7;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .atc-style-thumb {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
      background: #eee;
    }
    
    .atc-style-info {
      flex: 1;
      min-width: 0;
    }
    
    .atc-style-name {
      font-family: var(--font-serif, 'Domine', Georgia, serif);
      font-size: 15px;
      font-weight: 600;
      color: #3E2318;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .atc-style-id {
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    
    /* Loading State */
    .atc-loading {
      padding: 48px 24px;
      text-align: center;
      color: #888;
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
    }
    
    .atc-loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #eee;
      border-top-color: #C0715B;
      border-radius: 50%;
      animation: atcSpin 0.8s linear infinite;
      margin: 0 auto 12px;
    }
    
    @keyframes atcSpin {
      to { transform: rotate(360deg); }
    }
    
    /* Login Prompt */
    .atc-login-prompt {
      padding: 48px 24px;
      text-align: center;
    }
    
    .atc-login-icon {
      width: 64px;
      height: 64px;
      background: #FAF9F7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: #888;
    }
    
    .atc-login-title {
      font-family: var(--font-serif, 'Domine', Georgia, serif);
      font-size: 18px;
      font-weight: 600;
      color: #3E2318;
      margin: 0 0 8px 0;
    }
    
    .atc-login-text {
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 14px;
      color: #666;
      margin: 0 0 20px 0;
    }
    
    .atc-login-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #C0715B;
      color: white;
      border: none;
      border-radius: 8px;
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    
    .atc-login-btn:hover {
      background: #a85d45;
    }
    
    /* Collections List */
    .atc-collections-list {
      padding: 8px 0;
    }
    
    .atc-section-label {
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
      padding: 12px 24px 8px;
      margin: 0;
    }
    
    .atc-collection-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      cursor: pointer;
      transition: background 0.1s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }
    
    .atc-collection-item:hover {
      background: #FAF9F7;
    }
    
    .atc-collection-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .atc-collection-item.disabled:hover {
      background: transparent;
    }
    
    .atc-collection-color {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    .atc-collection-info {
      flex: 1;
      min-width: 0;
    }
    
    .atc-collection-name {
      font-family: var(--font-serif, 'Domine', Georgia, serif);
      font-size: 15px;
      font-weight: 600;
      color: #3E2318;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .atc-collection-meta {
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 12px;
      color: #888;
    }
    
    .atc-collection-badge {
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 11px;
      font-weight: 600;
      color: #16a34a;
      background: #dcfce7;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .atc-collection-check {
      color: #C0715B;
      flex-shrink: 0;
    }
    
    /* Create New Section */
    .atc-create-section {
      border-top: 1px solid #e5e5e5;
      margin-top: 8px;
    }
    
    .atc-create-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      cursor: pointer;
      transition: background 0.1s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }
    
    .atc-create-btn:hover {
      background: #FAF9F7;
    }
    
    .atc-create-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #FAF9F7;
      border: 2px dashed #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #888;
      transition: all 0.15s ease;
    }
    
    .atc-create-btn:hover .atc-create-icon {
      border-color: #C0715B;
      color: #C0715B;
      background: rgba(192, 113, 91, 0.06);
    }
    
    .atc-create-text {
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 14px;
      font-weight: 600;
      color: #666;
    }
    
    .atc-create-btn:hover .atc-create-text {
      color: #C0715B;
    }
    
    /* Create Form */
    .atc-create-form {
      padding: 20px 24px;
      border-top: 1px solid #e5e5e5;
      background: #FAF9F7;
    }
    
    .atc-form-label {
      display: block;
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 12px;
      font-weight: 600;
      color: #666;
      margin-bottom: 6px;
    }
    
    .atc-form-input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 14px;
      color: #333;
      margin-bottom: 16px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    
    .atc-form-input:focus {
      outline: none;
      border-color: #C0715B;
      box-shadow: 0 0 0 3px rgba(192, 113, 91, 0.15);
    }
    
    .atc-form-input::placeholder {
      color: #aaa;
    }
    
    .atc-color-picker {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .atc-color-swatch {
      aspect-ratio: 1;
      border-radius: 6px;
      border: 3px solid transparent;
      cursor: pointer;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    
    .atc-color-swatch:hover {
      transform: scale(1.1);
    }
    
    .atc-color-swatch.selected {
      border-color: #3E2318;
      transform: scale(1.1);
    }
    
    .atc-form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .atc-btn {
      padding: 10px 18px;
      border-radius: 6px;
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    
    .atc-btn-ghost {
      background: transparent;
      border: 1px solid #ddd;
      color: #666;
    }
    
    .atc-btn-ghost:hover {
      border-color: #999;
      color: #333;
    }
    
    .atc-btn-primary {
      background: #C0715B;
      border: none;
      color: white;
    }
    
    .atc-btn-primary:hover {
      background: #a85d45;
    }
    
    .atc-btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    /* Empty State */
    .atc-empty {
      padding: 32px 24px;
      text-align: center;
    }
    
    .atc-empty-icon {
      width: 56px;
      height: 56px;
      background: #FAF9F7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      color: #888;
    }
    
    .atc-empty-title {
      font-family: var(--font-serif, 'Domine', Georgia, serif);
      font-size: 16px;
      font-weight: 600;
      color: #3E2318;
      margin: 0 0 6px 0;
    }
    
    .atc-empty-text {
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 13px;
      color: #888;
      margin: 0;
    }
    
    /* Success Toast */
    .atc-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #3E2318;
      color: white;
      padding: 14px 24px;
      border-radius: 8px;
      font-family: var(--font-sans, 'Familjen Grotesk', sans-serif);
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      z-index: 10001;
      animation: atcToastIn 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .atc-toast.success {
      background: #16a34a;
    }
    
    .atc-toast.error {
      background: #dc2626;
    }
    
    @keyframes atcToastIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    
    .atc-toast-exit {
      animation: atcToastOut 0.2s ease forwards;
    }
    
    @keyframes atcToastOut {
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
    }
  `;
  
  // Inject styles
  function injectStyles() {
    if (document.getElementById('atc-modal-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'atc-modal-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }
  
  // Show toast notification
  function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.atc-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `atc-toast ${type}`;
    toast.innerHTML = `
      ${type === 'success' ? `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ` : `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `}
      ${message}
    `;
    document.body.appendChild(toast);
    
    // Auto-remove after delay
    setTimeout(() => {
      toast.classList.add('atc-toast-exit');
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }
  
  // Modal state
  let modalContainer = null;
  let currentStyleId = null;
  let currentStyleName = null;
  
  // Create and show the modal
  async function openAddToCollectionModal(styleId, styleName = null) {
    injectStyles();
    
    currentStyleId = styleId;
    currentStyleName = styleName;
    
    // Create modal container if doesn't exist
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'atc-modal-root';
      document.body.appendChild(modalContainer);
    }
    
    // Render modal
    renderModal();
  }
  
  // Close the modal
  function closeModal() {
    if (modalContainer) {
      modalContainer.innerHTML = '';
    }
    currentStyleId = null;
    currentStyleName = null;
  }
  
  // Render the modal content
  async function renderModal() {
    const supabase = getSupabase();
    
    // Show loading state
    modalContainer.innerHTML = `
      <div class="atc-modal-overlay" onclick="if(event.target === this) window.SocietyArts.closeAddToCollectionModal()">
        <div class="atc-modal">
          <div class="atc-modal-header">
            <h2 class="atc-modal-title">Add to Collection</h2>
            <button class="atc-close-btn" onclick="window.SocietyArts.closeAddToCollectionModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="atc-modal-body">
            <div class="atc-loading">
              <div class="atc-loading-spinner"></div>
              Loading collections...
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Check if user is logged in
    if (!supabase) {
      renderLoginPrompt();
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        renderLoginPrompt();
        return;
      }
      
      // Fetch user's collections (excluding subcollections - parent_id is null)
      const { data: collections, error } = await supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', user.id)
        .is('parent_id', null)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Get style info if not provided
      if (!currentStyleName && currentStyleId) {
        const { data: styleData } = await supabase
          .from('styles')
          .select('name')
          .eq('id', currentStyleId)
          .single();
        if (styleData) currentStyleName = styleData.name;
      }
      
      renderCollectionsList(collections || [], user.id);
      
    } catch (error) {
      console.error('[AddToCollectionModal] Error:', error);
      showToast('Failed to load collections', 'error');
      closeModal();
    }
  }
  
  // Render login prompt
  function renderLoginPrompt() {
    const modalBody = modalContainer.querySelector('.atc-modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
      <div class="atc-login-prompt">
        <div class="atc-login-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h3 class="atc-login-title">Sign in to Save</h3>
        <p class="atc-login-text">Create an account to save styles to your collections.</p>
        <button class="atc-login-btn" onclick="window.SocietyArts?.openAuthModal?.('signin'); window.SocietyArts.closeAddToCollectionModal();">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          Sign In
        </button>
      </div>
    `;
  }
  
  // Render collections list
  function renderCollectionsList(collections, userId) {
    const modalBody = modalContainer.querySelector('.atc-modal-body');
    if (!modalBody) return;
    
    // Check which collections already have this style
    const collectionsWithStyle = collections.filter(c => 
      c.styles && Array.isArray(c.styles) && c.styles.includes(currentStyleId)
    );
    const collectionsWithStyleIds = new Set(collectionsWithStyle.map(c => c.id));
    
    let html = '';
    
    // Style preview
    html += `
      <div class="atc-style-preview">
        <img 
          class="atc-style-thumb" 
          src="${getStyleThumbnail(currentStyleId)}" 
          alt="${currentStyleName || currentStyleId}"
          onerror="this.style.opacity='0.5'"
        />
        <div class="atc-style-info">
          <p class="atc-style-name">${currentStyleName || 'Art Style'}</p>
          <p class="atc-style-id">${currentStyleId}</p>
        </div>
      </div>
    `;
    
    if (collections.length > 0) {
      html += `<div class="atc-collections-list">`;
      html += `<p class="atc-section-label">Your Collections</p>`;
      
      collections.forEach(collection => {
        const styleCount = collection.styles?.length || 0;
        const alreadyAdded = collectionsWithStyleIds.has(collection.id);
        
        html += `
          <button 
            class="atc-collection-item ${alreadyAdded ? 'disabled' : ''}"
            onclick="${alreadyAdded ? '' : `window.SocietyArts._addStyleToCollection('${collection.id}')`}"
            ${alreadyAdded ? 'disabled' : ''}
          >
            <div class="atc-collection-color" style="background-color: ${collection.color || '#5C677D'}"></div>
            <div class="atc-collection-info">
              <p class="atc-collection-name">${escapeHtml(collection.name)}</p>
              <p class="atc-collection-meta">${styleCount} style${styleCount !== 1 ? 's' : ''}</p>
            </div>
            ${alreadyAdded ? `
              <span class="atc-collection-badge">Already added</span>
            ` : `
              <div class="atc-collection-check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
            `}
          </button>
        `;
      });
      
      html += `</div>`;
    } else {
      html += `
        <div class="atc-empty">
          <div class="atc-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <h4 class="atc-empty-title">No collections yet</h4>
          <p class="atc-empty-text">Create your first collection to start organizing styles.</p>
        </div>
      `;
    }
    
    // Create new collection button
    html += `
      <div class="atc-create-section">
        <button class="atc-create-btn" onclick="window.SocietyArts._showCreateCollectionForm()">
          <div class="atc-create-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span class="atc-create-text">Create New Collection</span>
        </button>
      </div>
    `;
    
    modalBody.innerHTML = html;
  }
  
  // Show create collection form
  function showCreateCollectionForm() {
    const createSection = modalContainer.querySelector('.atc-create-section');
    if (!createSection) return;
    
    // Get a random color from palette
    const randomColor = DEFAULT_PALETTE[Math.floor(Math.random() * DEFAULT_PALETTE.length)];
    
    createSection.innerHTML = `
      <div class="atc-create-form">
        <label class="atc-form-label">Collection Name</label>
        <input 
          type="text" 
          class="atc-form-input" 
          id="atc-new-collection-name"
          placeholder="My Collection"
          maxlength="50"
          autofocus
        />
        
        <label class="atc-form-label">Color</label>
        <div class="atc-color-picker">
          ${DEFAULT_PALETTE.map(color => `
            <div 
              class="atc-color-swatch ${color.hex === randomColor.hex ? 'selected' : ''}"
              style="background-color: ${color.hex}"
              data-color="${color.hex}"
              onclick="window.SocietyArts._selectColor(this, '${color.hex}')"
              title="${color.name}"
            ></div>
          `).join('')}
        </div>
        
        <div class="atc-form-actions">
          <button class="atc-btn atc-btn-ghost" onclick="window.SocietyArts._cancelCreateCollection()">
            Cancel
          </button>
          <button class="atc-btn atc-btn-primary" onclick="window.SocietyArts._createAndAddToCollection()">
            Create & Add
          </button>
        </div>
      </div>
    `;
    
    // Store selected color
    modalContainer.dataset.selectedColor = randomColor.hex;
    
    // Focus the input
    setTimeout(() => {
      const input = document.getElementById('atc-new-collection-name');
      if (input) input.focus();
    }, 50);
  }
  
  // Select color in picker
  function selectColor(element, colorHex) {
    // Remove selected from all
    modalContainer.querySelectorAll('.atc-color-swatch').forEach(swatch => {
      swatch.classList.remove('selected');
    });
    // Add to clicked one
    element.classList.add('selected');
    // Store selection
    modalContainer.dataset.selectedColor = colorHex;
  }
  
  // Cancel create collection
  function cancelCreateCollection() {
    renderModal(); // Re-render to reset
  }
  
  // Create new collection and add style
  async function createAndAddToCollection() {
    const nameInput = document.getElementById('atc-new-collection-name');
    const name = nameInput?.value?.trim();
    const color = modalContainer.dataset.selectedColor || DEFAULT_PALETTE[0].hex;
    
    if (!name) {
      nameInput?.focus();
      return;
    }
    
    const supabase = getSupabase();
    if (!supabase) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Create the collection with the style already in it
      const { data: newCollection, error } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          name: name,
          color: color,
          styles: [currentStyleId],
          parent_id: null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      showToast(`Added to "${name}"`, 'success');
      closeModal();
      
    } catch (error) {
      console.error('[AddToCollectionModal] Error creating collection:', error);
      showToast('Failed to create collection', 'error');
    }
  }
  
  // Add style to existing collection
  async function addStyleToCollection(collectionId) {
    const supabase = getSupabase();
    if (!supabase) return;
    
    try {
      // Get current collection
      const { data: collection, error: fetchError } = await supabase
        .from('user_collections')
        .select('*')
        .eq('id', collectionId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Add style to the array
      const currentStyles = collection.styles || [];
      if (currentStyles.includes(currentStyleId)) {
        showToast('Style already in collection', 'error');
        return;
      }
      
      const updatedStyles = [...currentStyles, currentStyleId];
      
      // Update the collection
      const { error: updateError } = await supabase
        .from('user_collections')
        .update({ 
          styles: updatedStyles,
          updated_at: new Date().toISOString()
        })
        .eq('id', collectionId);
      
      if (updateError) throw updateError;
      
      showToast(`Added to "${collection.name}"`, 'success');
      closeModal();
      
    } catch (error) {
      console.error('[AddToCollectionModal] Error adding to collection:', error);
      showToast('Failed to add to collection', 'error');
    }
  }
  
  // Helper to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  // Export functions to global namespace
  window.SocietyArts.openAddToCollectionModal = openAddToCollectionModal;
  window.SocietyArts.closeAddToCollectionModal = closeModal;
  window.SocietyArts._addStyleToCollection = addStyleToCollection;
  window.SocietyArts._showCreateCollectionForm = showCreateCollectionForm;
  window.SocietyArts._selectColor = selectColor;
  window.SocietyArts._cancelCreateCollection = cancelCreateCollection;
  window.SocietyArts._createAndAddToCollection = createAndAddToCollection;
  
  console.log('✅ [AddToCollectionModal] Component registered successfully');
  
})();
