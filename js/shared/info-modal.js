/* =====================================================
   SOCIETY ARTS - INFO MODAL
   Shared component for displaying help/info content
   
   Usage:
   1. Include this script in your page
   2. Call: SocietyArts.openInfoModal('topic-key')
   
   Dependencies:
   - supabase-client.js (window.SocietyArts.supabase)
   
   Content is pulled from the help_content database table
   ===================================================== */

(function() {
  'use strict';

  // ==========================================
  // STYLES
  // ==========================================
  
  const modalStyles = `
    /* Info Modal Overlay */
    .info-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: infoFadeIn 0.2s ease;
      font-family: 'Familjen Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 24px;
    }
    
    @keyframes infoFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    /* Modal Container */
    .info-modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: 85vh;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
      animation: infoSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    @keyframes infoSlideUp {
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
    .info-modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 24px 24px 0 24px;
      gap: 16px;
    }
    
    .info-modal-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #C0715B 0%, #A65D4A 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    
    .info-modal-title {
      font-family: 'Domine', Georgia, serif;
      font-size: 22px;
      font-weight: 600;
      color: #3E2318;
      margin: 0;
      flex: 1;
      line-height: 1.3;
      padding-top: 4px;
    }
    
    .info-modal-close {
      width: 36px;
      height: 36px;
      border: none;
      background: #F5F3F0;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8B7355;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }
    
    .info-modal-close:hover {
      background: #E7E2DC;
      color: #3E2318;
    }
    
    /* Modal Body */
    .info-modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px 24px 24px;
    }
    
    /* Content Styling */
    .info-modal-content {
      color: #5C5346;
      font-size: 15px;
      line-height: 1.7;
    }
    
    .info-modal-content p {
      margin: 0 0 16px 0;
    }
    
    .info-modal-content p:last-child {
      margin-bottom: 0;
    }
    
    .info-modal-content strong {
      color: #3E2318;
      font-weight: 600;
    }
    
    .info-modal-content ul,
    .info-modal-content ol {
      margin: 0 0 16px 0;
      padding-left: 24px;
    }
    
    .info-modal-content li {
      margin-bottom: 8px;
    }
    
    .info-modal-content li:last-child {
      margin-bottom: 0;
    }
    
    /* Custom bullet style */
    .info-modal-content ul {
      list-style: none;
      padding-left: 0;
    }
    
    .info-modal-content ul li {
      position: relative;
      padding-left: 20px;
    }
    
    .info-modal-content ul li::before {
      content: "•";
      color: #C0715B;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    
    /* Numbered list styling */
    .info-modal-content ol {
      list-style: none;
      padding-left: 0;
      counter-reset: item;
    }
    
    .info-modal-content ol li {
      position: relative;
      padding-left: 28px;
      counter-increment: item;
    }
    
    .info-modal-content ol li::before {
      content: counter(item);
      position: absolute;
      left: 0;
      top: 0;
      width: 20px;
      height: 20px;
      background: #F5F3F0;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
      color: #C0715B;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Media - Image */
    .info-modal-image {
      width: 100%;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    
    /* Media - Video */
    .info-modal-video {
      width: 100%;
      border-radius: 12px;
      margin-bottom: 20px;
      aspect-ratio: 16/9;
      background: #F5F3F0;
    }
    
    /* Action Button */
    .info-modal-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 24px;
      background: #C0715B;
      color: white;
      border: none;
      border-radius: 9999px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s ease;
      text-decoration: none;
      margin-top: 20px;
    }
    
    .info-modal-action:hover {
      background: #A65D4A;
    }
    
    /* Loading State */
    .info-modal-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: #8B7355;
    }
    
    .info-modal-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #E7E2DC;
      border-top-color: #C0715B;
      border-radius: 50%;
      animation: infoSpin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    
    @keyframes infoSpin {
      to { transform: rotate(360deg); }
    }
    
    /* Error State */
    .info-modal-error {
      text-align: center;
      padding: 32px 24px;
      color: #8B7355;
    }
    
    .info-modal-error-icon {
      width: 48px;
      height: 48px;
      background: #FEF3F2;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: #DC2626;
    }
    
    /* Info Button (for use on pages) */
    .info-button {
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
    
    .info-button:hover {
      background: #E7E2DC;
      color: #3E2318;
    }
    
    /* Responsive */
    @media (max-width: 560px) {
      .info-modal-overlay {
        padding: 16px;
      }
      
      .info-modal {
        max-height: 90vh;
      }
      
      .info-modal-header {
        padding: 20px 20px 0 20px;
      }
      
      .info-modal-body {
        padding: 16px 20px 20px 20px;
      }
      
      .info-modal-title {
        font-size: 20px;
      }
      
      .info-modal-icon {
        width: 40px;
        height: 40px;
      }
    }
  `;

  // ==========================================
  // STATE
  // ==========================================
  
  let modalElement = null;
  let stylesInjected = false;
  let contentCache = {}; // Cache loaded content

  // ==========================================
  // HELPERS
  // ==========================================
  
  function getSupabase() {
    return window.SocietyArts?.supabase || window.supabaseClient || window.supabase;
  }
  
  function injectStyles() {
    if (stylesInjected) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'info-modal-styles';
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
  
  // Simple markdown-like parsing
  function parseContent(text) {
    if (!text) return '';
    
    let html = escapeHtml(text);
    
    // Bold: **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Line breaks to paragraphs
    const paragraphs = html.split(/\n\n+/);
    
    html = paragraphs.map(p => {
      // Check if this is a list
      const lines = p.split('\n');
      const isBulletList = lines.every(l => l.trim().startsWith('•') || l.trim() === '');
      const isNumberedList = lines.every(l => /^\d+\./.test(l.trim()) || l.trim() === '');
      
      if (isBulletList && lines.some(l => l.trim().startsWith('•'))) {
        const items = lines
          .filter(l => l.trim().startsWith('•'))
          .map(l => `<li>${l.trim().substring(1).trim()}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }
      
      if (isNumberedList && lines.some(l => /^\d+\./.test(l.trim()))) {
        const items = lines
          .filter(l => /^\d+\./.test(l.trim()))
          .map(l => `<li>${l.trim().replace(/^\d+\.\s*/, '')}</li>`)
          .join('');
        return `<ol>${items}</ol>`;
      }
      
      // Regular paragraph
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
    
    return html;
  }

  // ==========================================
  // DATA LOADING
  // ==========================================
  
  async function loadContent(topicKey) {
    // Check cache first
    if (contentCache[topicKey]) {
      return contentCache[topicKey];
    }
    
    const supabase = getSupabase();
    if (!supabase?.from) {
      console.error('Supabase client not available');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('help_content')
        .select('*')
        .eq('topic_key', topicKey)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      // Cache the result
      if (data) {
        contentCache[topicKey] = data;
      }
      
      return data;
    } catch (err) {
      console.error('Error loading help content:', err);
      return null;
    }
  }

  // ==========================================
  // MODAL RENDERING
  // ==========================================
  
  function renderLoading() {
    return `
      <div class="info-modal-overlay" id="infoModalOverlay">
        <div class="info-modal">
          <div class="info-modal-loading">
            <div class="info-modal-spinner"></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    `;
  }
  
  function renderError() {
    return `
      <div class="info-modal-overlay" id="infoModalOverlay">
        <div class="info-modal">
          <div class="info-modal-header">
            <div></div>
            <button class="info-modal-close" id="infoModalClose">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="info-modal-error">
            <div class="info-modal-error-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p>Unable to load help content.<br>Please try again later.</p>
          </div>
        </div>
      </div>
    `;
  }
  
  function renderModal(content) {
    const bodyHtml = parseContent(content.body);
    
    return `
      <div class="info-modal-overlay" id="infoModalOverlay">
        <div class="info-modal">
          <div class="info-modal-header">
            <div class="info-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h2 class="info-modal-title">${escapeHtml(content.title)}</h2>
            <button class="info-modal-close" id="infoModalClose">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="info-modal-body">
            ${content.image_url ? `
              <img class="info-modal-image" src="${escapeHtml(content.image_url)}" alt="">
            ` : ''}
            
            ${content.video_url ? `
              <iframe 
                class="info-modal-video" 
                src="${escapeHtml(content.video_url)}" 
                frameborder="0" 
                allowfullscreen>
              </iframe>
            ` : ''}
            
            <div class="info-modal-content">
              ${bodyHtml}
            </div>
            
            ${content.button_text && content.button_url ? `
              <a class="info-modal-action" href="${escapeHtml(content.button_url)}" target="_blank">
                ${escapeHtml(content.button_text)}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ` : ''}
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
    document.getElementById('infoModalClose')?.addEventListener('click', closeModal);
    
    // Overlay click to close
    document.getElementById('infoModalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'infoModalOverlay') closeModal();
    });
    
    // Escape key to close
    document.addEventListener('keydown', handleEscapeKey);
  }
  
  function handleEscapeKey(e) {
    if (e.key === 'Escape' && modalElement) {
      closeModal();
    }
  }

  // ==========================================
  // MODAL LIFECYCLE
  // ==========================================
  
  async function openModal(topicKey) {
    if (!topicKey) {
      console.error('Info modal requires a topic key');
      return;
    }
    
    // Inject styles
    injectStyles();
    
    // Show loading state
    const wrapper = document.createElement('div');
    wrapper.innerHTML = renderLoading();
    document.body.appendChild(wrapper.firstElementChild);
    modalElement = document.getElementById('infoModalOverlay');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Allow clicking overlay to close during loading
    modalElement?.addEventListener('click', (e) => {
      if (e.target.id === 'infoModalOverlay') closeModal();
    });
    document.addEventListener('keydown', handleEscapeKey);
    
    // Load content
    const content = await loadContent(topicKey);
    
    if (!content) {
      // Show error state
      modalElement.outerHTML = renderError();
      modalElement = document.getElementById('infoModalOverlay');
      attachEventListeners();
      return;
    }
    
    // Render full modal
    modalElement.outerHTML = renderModal(content);
    modalElement = document.getElementById('infoModalOverlay');
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
  }
  
  // Clear cache (useful if content is updated)
  function clearCache(topicKey = null) {
    if (topicKey) {
      delete contentCache[topicKey];
    } else {
      contentCache = {};
    }
  }

  // ==========================================
  // INFO BUTTON HELPER
  // ==========================================
  
  // Creates an info button element that opens a modal
  function createInfoButton(topicKey, options = {}) {
    const btn = document.createElement('button');
    btn.className = options.className || 'info-button';
    btn.title = options.title || 'Help';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal(topicKey);
    });
    return btn;
  }

  // ==========================================
  // PUBLIC API
  // ==========================================
  
  window.SocietyArts = window.SocietyArts || {};
  
  // Main entry point
  window.SocietyArts.openInfoModal = openModal;
  window.SocietyArts.closeInfoModal = closeModal;
  window.SocietyArts.createInfoButton = createInfoButton;
  window.SocietyArts.clearInfoCache = clearCache;
  
  // Also expose as standalone functions
  window.openInfoModal = openModal;
  
  console.log('Info Modal loaded');
  
})();
