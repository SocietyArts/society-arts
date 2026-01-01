/* =====================================================
   SOCIETY ARTS - ADD TO COLLECTION MODAL
   Shared component for adding styles to collections
   
   Usage:
   1. Include this script in your page
   2. Call: SocietyArts.openAddToCollectionModal(styleId, styleName)
   
   Dependencies:
   - supabase-client.js (window.SocietyArts.supabase)
   - User must be authenticated
   ===================================================== */

(function() {
  'use strict';

  // ==========================================
  // CONFIGURATION
  // ==========================================
  
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

  // ==========================================
  // STYLES (injected once)
  // ==========================================
  
  const modalStyles = `
    /* Add to Collection Modal Overlay */
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
      font-family: 'Familjen Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    @keyframes atcFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    /* Modal Container */
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
    
    /* Modal Header */
    .atc-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #E7E2DC;
    }
    
    .atc-modal-title {
      font-family: 'Domine', Georgia, serif;
      font-size: 20px;
      font-weight: 500;
      color: #3E2318;
      margin: 0;
    }
    
    .atc-modal-close {
      width: 32px;
      height: 32px;
      border: none;
      background: #F5F3F0;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8B7355;
      transition: all 0.15s ease;
    }
    
    .atc-modal-close:hover {
      background: #E7E2DC;
      color: #3E2318;
    }
    
    /* Style Preview */
    .atc-style-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: #FAF9F7;
      border-bottom: 1px solid #E7E2DC;
    }
    
    .atc-style-thumbnail {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
      background: #E7E2DC;
    }
    
    .atc-style-name {
      font-size: 14px;
      font-weight: 600;
      color: #3E2318;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* Modal Body */
    .atc-modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    
    /* Section Header */
    .atc-section-header {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #8B7355;
      padding: 12px 24px 8px;
    }
    
    /* Collection List */
    .atc-collection-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .atc-collection-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 24px;
      cursor: pointer;
      transition: background 0.15s ease;
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
    
    /* Collection Color Swatch */
    .atc-collection-color {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    /* Collection Info */
    .atc-collection-info {
      flex: 1;
      min-width: 0;
    }
    
    .atc-collection-name {
      font-size: 15px;
      font-weight: 500;
      color: #3E2318;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .atc-collection-meta {
      font-size: 12px;
      color: #8B7355;
      margin-top: 2px;
    }
    
    /* Nested collection indicator */
    .atc-collection-item.nested {
      padding-left: 48px;
    }
    
    .atc-collection-item.nested .atc-collection-color {
      width: 28px;
      height: 28px;
    }
    
    /* Check icon for already added */
    .atc-collection-check {
      color: #81B29A;
      flex-shrink: 0;
    }
    
    /* Folder expand/collapse */
    .atc-folder-toggle {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8B7355;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }
    
    .atc-folder-toggle.expanded {
      transform: rotate(90deg);
    }
    
    /* Create New Section */
    .atc-create-section {
      padding: 16px 24px;
      border-top: 1px solid #E7E2DC;
      background: #FAF9F7;
    }
    
    .atc-create-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #C0715B;
      cursor: pointer;
      padding: 8px 0;
      border: none;
      background: none;
      width: 100%;
    }
    
    .atc-create-toggle:hover {
      color: #A65D4A;
    }
    
    .atc-create-form {
      display: none;
      margin-top: 12px;
    }
    
    .atc-create-form.visible {
      display: block;
    }
    
    .atc-create-input {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid #D4CEC4;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      color: #3E2318;
      margin-bottom: 12px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    
    .atc-create-input:focus {
      outline: none;
      border-color: #C0715B;
      box-shadow: 0 0 0 3px rgba(192, 113, 91, 0.15);
    }
    
    .atc-create-input::placeholder {
      color: #B5AA9A;
    }
    
    .atc-create-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .atc-btn {
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    
    .atc-btn-ghost {
      border: 1px solid #D4CEC4;
      background: white;
      color: #5C5346;
    }
    
    .atc-btn-ghost:hover {
      border-color: #B5AA9A;
      background: #FAF9F7;
    }
    
    .atc-btn-primary {
      border: none;
      background: #C0715B;
      color: white;
    }
    
    .atc-btn-primary:hover {
      background: #A65D4A;
    }
    
    .atc-btn-primary:disabled {
      background: #D4CEC4;
      cursor: not-allowed;
    }
    
    /* Empty State */
    .atc-empty-state {
      text-align: center;
      padding: 32px 24px;
      color: #8B7355;
    }
    
    .atc-empty-icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 12px;
      background: #F5F3F0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #B5AA9A;
    }
    
    .atc-empty-text {
      font-size: 14px;
      line-height: 1.5;
    }
    
    /* Toast Notification */
    .atc-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #3E2318;
      color: white;
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      z-index: 10001;
      opacity: 0;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    }
    
    .atc-toast.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    
    .atc-toast.success {
      background: #588157;
    }
    
    .atc-toast.error {
      background: #C0392B;
    }
    
    /* Loading State */
    .atc-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: #8B7355;
    }
    
    .atc-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #E7E2DC;
      border-top-color: #C0715B;
      border-radius: 50%;
      animation: atcSpin 0.8s linear infinite;
      margin-right: 12px;
    }
    
    @keyframes atcSpin {
      to { transform: rotate(360deg); }
    }
  `;

  // ==========================================
  // STATE
  // ==========================================
  
  let modalElement = null;
  let toastElement = null;
  let stylesInjected = false;
  let currentStyleId = null;
  let currentStyleName = null;
  let collections = [];
  let palette = DEFAULT_PALETTE;
  let expandedFolders = new Set();

  // ==========================================
  // HELPERS
  // ==========================================
  
  function getSupabase() {
    return window.SocietyArts?.supabase || window.supabaseClient || window.supabase;
  }
  
  function getCurrentUser() {
    // Try multiple ways to get the current user
    return window.AuthState?.user || 
           window.SocietyArts?.AuthState?.user || 
           window.SocietyArts?.currentUser;
  }
  
  function getStyleThumbnail(styleId) {
    return window.SocietyArts?.getStyleThumbnailUrl?.(styleId, 0) ||
           window.SocietyArts?.getAltStyleThumbnailUrl?.(styleId) ||
           `https://pub-acb560f551f141db830964aed1fa005f.r2.dev/${styleId}/${styleId}-00.webp`;
  }
  
  function injectStyles() {
    if (stylesInjected) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'atc-modal-styles';
    styleEl.textContent = modalStyles;
    document.head.appendChild(styleEl);
    stylesInjected = true;
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  
  function showToast(message, type = 'success') {
    if (!toastElement) {
      toastElement = document.createElement('div');
      toastElement.className = 'atc-toast';
      document.body.appendChild(toastElement);
    }
    
    toastElement.textContent = message;
    toastElement.className = `atc-toast ${type}`;
    
    // Trigger reflow
    toastElement.offsetHeight;
    
    toastElement.classList.add('visible');
    
    setTimeout(() => {
      toastElement.classList.remove('visible');
    }, 3000);
  }

  // ==========================================
  // DATA LOADING
  // ==========================================
  
  async function loadCollections(userId) {
    const supabase = getSupabase();
    if (!supabase?.from) {
      console.error('Supabase client not available');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('user_collections')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading collections:', err);
      return [];
    }
  }
  
  async function loadPalette() {
    const supabase = getSupabase();
    if (!supabase?.from) return DEFAULT_PALETTE;
    
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'collection_palette')
        .single();
      
      if (data?.value?.colors) {
        return data.value.colors;
      }
    } catch (err) {
      console.log('Using default palette');
    }
    return DEFAULT_PALETTE;
  }

  // ==========================================
  // COLLECTION OPERATIONS
  // ==========================================
  
  async function addStyleToCollection(collectionId) {
    const supabase = getSupabase();
    if (!supabase?.from) {
      showToast('Unable to save. Please try again.', 'error');
      return false;
    }
    
    try {
      // Get current collection
      const collection = collections.find(c => c.id === collectionId);
      if (!collection) throw new Error('Collection not found');
      
      // Check if style already in collection
      const currentStyles = collection.styles || [];
      if (currentStyles.includes(currentStyleId)) {
        showToast('Style already in this collection');
        return false;
      }
      
      // Check limit (25 styles max)
      if (currentStyles.length >= 25) {
        showToast('Collection is full (25 styles max)', 'error');
        return false;
      }
      
      // Add style
      const updatedStyles = [...currentStyles, currentStyleId];
      
      const { error } = await supabase
        .from('user_collections')
        .update({
          styles: updatedStyles,
          updated_at: new Date().toISOString()
        })
        .eq('id', collectionId);
      
      if (error) throw error;
      
      // Update local state
      collection.styles = updatedStyles;
      
      showToast(`Added to "${collection.name}"`, 'success');
      closeModal();
      return true;
    } catch (err) {
      console.error('Error adding style to collection:', err);
      showToast('Failed to add style. Please try again.', 'error');
      return false;
    }
  }
  
  async function createCollectionAndAdd(name) {
    const supabase = getSupabase();
    const user = getCurrentUser();
    
    if (!supabase?.from || !user) {
      showToast('Unable to create collection. Please try again.', 'error');
      return false;
    }
    
    try {
      // Get least used color
      const colorCounts = {};
      palette.forEach(c => colorCounts[c.hex] = 0);
      collections.forEach(c => {
        if (c.color && colorCounts[c.color] !== undefined) {
          colorCounts[c.color]++;
        }
      });
      
      let minCount = Infinity;
      let selectedColor = palette[0].hex;
      for (const [hex, count] of Object.entries(colorCounts)) {
        if (count < minCount) {
          minCount = count;
          selectedColor = hex;
        }
      }
      
      // Create collection with style
      const { data, error } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          name: name.trim(),
          color: selectedColor,
          styles: [currentStyleId]
        })
        .select()
        .single();
      
      if (error) throw error;
      
      showToast(`Created "${name}" and added style`, 'success');
      closeModal();
      return true;
    } catch (err) {
      console.error('Error creating collection:', err);
      showToast('Failed to create collection. Please try again.', 'error');
      return false;
    }
  }

  // ==========================================
  // MODAL RENDERING
  // ==========================================
  
  function buildCollectionTree(collections) {
    // Separate root and nested collections
    const roots = collections.filter(c => !c.parent_id);
    const children = collections.filter(c => c.parent_id);
    
    // Build tree structure
    const tree = [];
    
    roots.forEach(root => {
      tree.push({ ...root, level: 0 });
      
      // Find children
      const findChildren = (parentId, level) => {
        children
          .filter(c => c.parent_id === parentId)
          .forEach(child => {
            tree.push({ ...child, level });
            findChildren(child.id, level + 1);
          });
      };
      
      if (expandedFolders.has(root.id)) {
        findChildren(root.id, 1);
      }
    });
    
    return tree;
  }
  
  function renderCollectionItem(collection) {
    const hasChildren = collections.some(c => c.parent_id === collection.id);
    const isExpanded = expandedFolders.has(collection.id);
    const styleCount = (collection.styles || []).length;
    const hasStyle = (collection.styles || []).includes(currentStyleId);
    const isNested = collection.level > 0;
    const paletteColor = palette.find(c => c.hex === collection.color) || palette[0];
    
    return `
      <button class="atc-collection-item ${isNested ? 'nested' : ''} ${hasStyle ? 'disabled' : ''}"
              data-collection-id="${collection.id}"
              data-has-children="${hasChildren}"
              ${hasStyle ? 'disabled' : ''}>
        ${hasChildren ? `
          <span class="atc-folder-toggle ${isExpanded ? 'expanded' : ''}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
        ` : ''}
        <div class="atc-collection-color" style="background-color: ${collection.color || paletteColor.hex}"></div>
        <div class="atc-collection-info">
          <div class="atc-collection-name">${escapeHtml(collection.name)}</div>
          <div class="atc-collection-meta">${styleCount} style${styleCount !== 1 ? 's' : ''}</div>
        </div>
        ${hasStyle ? `
          <span class="atc-collection-check">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        ` : ''}
      </button>
    `;
  }
  
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  function renderModal() {
    const tree = buildCollectionTree(collections);
    const thumbnail = getStyleThumbnail(currentStyleId);
    
    const collectionsHtml = tree.length > 0 
      ? tree.map(renderCollectionItem).join('')
      : `
        <div class="atc-empty-state">
          <div class="atc-empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div class="atc-empty-text">No collections yet.<br>Create one below to get started.</div>
        </div>
      `;
    
    return `
      <div class="atc-modal-overlay" id="atcModalOverlay">
        <div class="atc-modal">
          <div class="atc-modal-header">
            <h3 class="atc-modal-title">Add to Collection</h3>
            <button class="atc-modal-close" id="atcModalClose">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="atc-style-preview">
            <img class="atc-style-thumbnail" src="${thumbnail}" alt="" onerror="this.style.opacity=0.3">
            <span class="atc-style-name">${escapeHtml(currentStyleName || currentStyleId)}</span>
          </div>
          
          <div class="atc-modal-body">
            ${tree.length > 0 ? '<div class="atc-section-header">Your Collections</div>' : ''}
            <div class="atc-collection-list" id="atcCollectionList">
              ${collectionsHtml}
            </div>
          </div>
          
          <div class="atc-create-section">
            <button class="atc-create-toggle" id="atcCreateToggle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create New Collection
            </button>
            <div class="atc-create-form" id="atcCreateForm">
              <input type="text" 
                     class="atc-create-input" 
                     id="atcNewCollectionName" 
                     placeholder="Collection name..."
                     maxlength="50">
              <div class="atc-create-actions">
                <button class="atc-btn atc-btn-ghost" id="atcCreateCancel">Cancel</button>
                <button class="atc-btn atc-btn-primary" id="atcCreateSave" disabled>Create & Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  function renderLoading() {
    return `
      <div class="atc-modal-overlay" id="atcModalOverlay">
        <div class="atc-modal">
          <div class="atc-modal-header">
            <h3 class="atc-modal-title">Add to Collection</h3>
            <button class="atc-modal-close" id="atcModalClose">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="atc-loading">
            <div class="atc-spinner"></div>
            <span>Loading collections...</span>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  
  function attachEventListeners() {
    // Close button
    document.getElementById('atcModalClose')?.addEventListener('click', closeModal);
    
    // Overlay click to close
    document.getElementById('atcModalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'atcModalOverlay') closeModal();
    });
    
    // Collection items
    document.getElementById('atcCollectionList')?.addEventListener('click', async (e) => {
      const item = e.target.closest('.atc-collection-item');
      if (!item || item.disabled) return;
      
      const collectionId = item.dataset.collectionId;
      const hasChildren = item.dataset.hasChildren === 'true';
      
      // If folder, toggle expand
      if (hasChildren && e.target.closest('.atc-folder-toggle')) {
        if (expandedFolders.has(collectionId)) {
          expandedFolders.delete(collectionId);
        } else {
          expandedFolders.add(collectionId);
        }
        updateModalContent();
        return;
      }
      
      // Add to collection
      await addStyleToCollection(collectionId);
    });
    
    // Create toggle
    document.getElementById('atcCreateToggle')?.addEventListener('click', () => {
      const form = document.getElementById('atcCreateForm');
      form?.classList.toggle('visible');
      if (form?.classList.contains('visible')) {
        document.getElementById('atcNewCollectionName')?.focus();
      }
    });
    
    // Create cancel
    document.getElementById('atcCreateCancel')?.addEventListener('click', () => {
      document.getElementById('atcCreateForm')?.classList.remove('visible');
      document.getElementById('atcNewCollectionName').value = '';
    });
    
    // Create input
    document.getElementById('atcNewCollectionName')?.addEventListener('input', (e) => {
      const saveBtn = document.getElementById('atcCreateSave');
      if (saveBtn) {
        saveBtn.disabled = !e.target.value.trim();
      }
    });
    
    // Create save
    document.getElementById('atcCreateSave')?.addEventListener('click', async () => {
      const input = document.getElementById('atcNewCollectionName');
      const name = input?.value?.trim();
      if (name) {
        await createCollectionAndAdd(name);
      }
    });
    
    // Enter key in input
    document.getElementById('atcNewCollectionName')?.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const name = e.target.value.trim();
        if (name) {
          await createCollectionAndAdd(name);
        }
      }
    });
    
    // Escape key to close
    document.addEventListener('keydown', handleEscapeKey);
  }
  
  function handleEscapeKey(e) {
    if (e.key === 'Escape' && modalElement) {
      closeModal();
    }
  }
  
  function updateModalContent() {
    if (!modalElement) return;
    
    const newContent = renderModal();
    const temp = document.createElement('div');
    temp.innerHTML = newContent;
    
    const newBody = temp.querySelector('.atc-modal-body');
    const currentBody = modalElement.querySelector('.atc-modal-body');
    
    if (newBody && currentBody) {
      currentBody.innerHTML = newBody.innerHTML;
    }
    
    // Re-attach collection list events
    document.getElementById('atcCollectionList')?.addEventListener('click', async (e) => {
      const item = e.target.closest('.atc-collection-item');
      if (!item || item.disabled) return;
      
      const collectionId = item.dataset.collectionId;
      const hasChildren = item.dataset.hasChildren === 'true';
      
      if (hasChildren && e.target.closest('.atc-folder-toggle')) {
        if (expandedFolders.has(collectionId)) {
          expandedFolders.delete(collectionId);
        } else {
          expandedFolders.add(collectionId);
        }
        updateModalContent();
        return;
      }
      
      await addStyleToCollection(collectionId);
    });
  }

  // ==========================================
  // MODAL LIFECYCLE
  // ==========================================
  
  async function openModal(styleId, styleName) {
    // Check auth
    const user = getCurrentUser();
    if (!user) {
      // Try to open auth modal
      if (window.SocietyArts?.openAuthModal) {
        window.SocietyArts.openAuthModal();
      } else {
        showToast('Please sign in to add to collections', 'error');
      }
      return;
    }
    
    // Inject styles
    injectStyles();
    
    // Store current style
    currentStyleId = styleId;
    currentStyleName = styleName || styleId;
    
    // Create and show loading modal
    modalElement = document.createElement('div');
    modalElement.innerHTML = renderLoading();
    document.body.appendChild(modalElement.firstElementChild);
    modalElement = document.getElementById('atcModalOverlay');
    
    // Attach close handlers
    document.getElementById('atcModalClose')?.addEventListener('click', closeModal);
    modalElement?.addEventListener('click', (e) => {
      if (e.target.id === 'atcModalOverlay') closeModal();
    });
    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Load data
    [collections, palette] = await Promise.all([
      loadCollections(user.id),
      loadPalette()
    ]);
    
    // Update modal with content
    modalElement.outerHTML = renderModal();
    modalElement = document.getElementById('atcModalOverlay');
    
    // Attach all event listeners
    attachEventListeners();
  }
  
  function closeModal() {
    if (modalElement) {
      modalElement.remove();
      modalElement = null;
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove escape listener
    document.removeEventListener('keydown', handleEscapeKey);
    
    // Reset state
    currentStyleId = null;
    currentStyleName = null;
    expandedFolders.clear();
  }

  // ==========================================
  // PUBLIC API
  // ==========================================
  
  window.SocietyArts = window.SocietyArts || {};
  
  // Main entry point
  window.SocietyArts.openAddToCollectionModal = openModal;
  
  // Also expose as standalone function
  window.openAddToCollectionModal = openModal;
  
  console.log('Add to Collection modal loaded');
  
})();
