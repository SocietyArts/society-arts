/* ========================================
   SOCIETY ARTS - STORY PANEL
   Left sidebar for story display
   Version: 5.0 (v20)
   ======================================== */

/**
 * Panel Header Component (reusable for all 3 panels)
 */
function PanelHeader({ title, hasContent, infoContent, onInfoClick, showInfo }) {
  const headerClass = hasContent ? 'panel-header panel-header-active' : 'panel-header';
  
  return (
    <div className={headerClass}>
      <span className="panel-header-title">{title}</span>
      {infoContent && (
        <button 
          className={`panel-info-btn ${showInfo ? 'active' : ''}`}
          onClick={onInfoClick}
          title="More info"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Info Tooltip Component
 */
function InfoTooltip({ show, onClose, children }) {
  if (!show) return null;
  
  return (
    <div className="panel-info-tooltip">
      <div className="panel-info-content">
        {children}
        <button className="panel-info-close" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

/**
 * Main Story Card Component
 */
function StoryCard({ story, isVoiceMode, transformedStory, transformLabel, onClearTransform, onStoryChange }) {
  const [showInfo, setShowInfo] = React.useState(false);
  const textareaRef = React.useRef(null);
  
  const displayStory = transformedStory || story || '';
  const isTransformed = !!transformedStory;
  const hasContent = displayStory.length > 0;

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [displayStory]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    if (onStoryChange) {
      onStoryChange(newValue);
    }
  };

  return (
    <div className="card story-card">
      <PanelHeader 
        title="Your Story"
        hasContent={hasContent}
        infoContent={true}
        onInfoClick={() => setShowInfo(!showInfo)}
        showInfo={showInfo}
      />
      
      <InfoTooltip show={showInfo} onClose={() => setShowInfo(false)}>
        <h4>Your Story</h4>
        <p>This panel captures your story as you share it through voice or text conversation.</p>
        <ul>
          <li><strong>Auto-populates</strong> as you tell your story</li>
          <li><strong>Editable</strong> — type directly or refine any words</li>
        </ul>
      </InfoTooltip>
      
      <div className="card-content">
        <div className="story-badges">
          {isVoiceMode && <span className="badge badge-muted">🎤 Voice</span>}
          {isTransformed && (
            <span className="badge badge-accent">{transformLabel}</span>
          )}
        </div>
        <textarea
          ref={textareaRef}
          className="story-textarea"
          value={displayStory}
          onChange={handleTextChange}
          placeholder="Your story will appear here as you share it — or type directly to begin."
          disabled={isTransformed}
        />
        {isTransformed && (
          <button 
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '12px', fontSize: '12px' }}
            onClick={onClearTransform}
          >
            ← Back to original
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Variation Tooltip Component
 */
function VariationTooltip({ variation, show }) {
  if (!show) return null;
  
  const tooltips = {
    optimize: {
      title: 'Optimize',
      description: 'Takes all the words in your story and optimizes them for the creative engine, ensuring the best possible visual interpretation of your ideas.'
    },
    enrich: {
      title: 'Enrich',
      description: 'Embellishes your story with additional detail and descriptive content, adding depth and richness to help create more vivid and immersive visuals.'
    },
    simplify: {
      title: 'Simplify',
      description: 'Distills your story down to its essential concept, removing complexity to create a clear, focused visual that captures the core idea.'
    },
    noPeople: {
      title: 'No People',
      description: 'Reimagines your story without human figures. Often visuals communicate more powerfully through symbolism, objects, or abstract representation rather than depicting people directly.'
    }
  };
  
  const tooltip = tooltips[variation] || { title: variation, description: '' };
  
  return (
    <div className="variation-tooltip">
      <div className="variation-tooltip-title">{tooltip.title}</div>
      <div className="variation-tooltip-desc">{tooltip.description}</div>
    </div>
  );
}

/**
 * Variation Selector Component (integrated from variations.js)
 */
function VariationSelector({ currentStory, onVariationApplied, disabled }) {
  const [variations, setVariations] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(null);
  const [showInfo, setShowInfo] = React.useState(false);
  const [hoveredVariation, setHoveredVariation] = React.useState(null);

  // Load config on mount
  React.useEffect(() => {
    if (window.SocietyArts?.Variations?.loadConfig) {
      window.SocietyArts.Variations.loadConfig().then(config => {
        setVariations(config.variations);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleVariationClick = async (typeId) => {
    if (!currentStory || generating) return;
    
    setGenerating(typeId);
    
    try {
      const result = await window.SocietyArts.Variations.generate(currentStory, typeId);
      
      if (result.success && onVariationApplied) {
        onVariationApplied(result.variation, result.label);
      } else if (!result.success) {
        console.error('Variation failed:', result.error);
      }
    } catch (error) {
      console.error('Variation error:', error);
    }
    
    setGenerating(null);
  };

  const getIcon = (iconName) => {
    const icons = {
      sparkles: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
          <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z"/>
        </svg>
      ),
      palette: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="13.5" cy="6.5" r="1.5"/>
          <circle cx="17.5" cy="10.5" r="1.5"/>
          <circle cx="8.5" cy="7.5" r="1.5"/>
          <circle cx="6.5" cy="12.5" r="1.5"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
        </svg>
      ),
      minimize: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 14 10 14 10 20"/>
          <polyline points="20 10 14 10 14 4"/>
          <line x1="14" y1="10" x2="21" y2="3"/>
          <line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      ),
      userMinus: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="8.5" cy="7" r="4"/>
          <line x1="23" y1="11" x2="17" y2="11"/>
        </svg>
      )
    };
    return icons[iconName] || icons.sparkles;
  };

  // Map variation IDs to tooltip keys
  const getTooltipKey = (id) => {
    const mapping = {
      'optimize': 'optimize',
      'enrich': 'enrich',
      'simplify': 'simplify',
      'no-people': 'noPeople'
    };
    return mapping[id] || id;
  };

  if (loading) {
    return (
      <div className="variation-selector loading">
        <span>Loading variations...</span>
      </div>
    );
  }

  const variationList = Object.values(variations);

  if (variationList.length === 0) {
    return null;
  }

  return (
    <div className="variation-selector">
      <PanelHeader 
        title="Transform Your Story"
        hasContent={false}
        infoContent={true}
        onInfoClick={() => setShowInfo(!showInfo)}
        showInfo={showInfo}
      />
      
      <InfoTooltip show={showInfo} onClose={() => setShowInfo(false)}>
        <h4>Transform Your Story</h4>
        <p>These tools help you refine your story for the best visual results. Hover over each option to learn more about what it does.</p>
      </InfoTooltip>
      
      <div className="variation-buttons">
        {variationList.map((variation) => (
          <div 
            key={variation.id}
            className="variation-btn-wrapper"
            onMouseEnter={() => setHoveredVariation(variation.id)}
            onMouseLeave={() => setHoveredVariation(null)}
          >
            <button
              className={`variation-btn ${generating === variation.id ? 'generating' : ''}`}
              onClick={() => handleVariationClick(variation.id)}
              disabled={disabled || !currentStory || generating}
            >
              <span className="variation-btn-icon">
                {generating === variation.id ? (
                  <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12"/>
                  </svg>
                ) : (
                  getIcon(variation.icon)
                )}
              </span>
              <span className="variation-btn-label">{variation.label}</span>
            </button>
            <VariationTooltip 
              variation={getTooltipKey(variation.id)} 
              show={hoveredVariation === variation.id}
            />
          </div>
        ))}
      </div>
      {!currentStory && (
        <div className="variation-hint">Share your story first to unlock transformations</div>
      )}
    </div>
  );
}

/**
 * Story Panel Component
 */
function StoryPanel({ 
  story, 
  title,
  isVoiceMode,
  isLoading,
  transformedStory,
  transformLabel,
  onVariationApplied,
  onClearTransform,
  onStoryChange
}) {
  return (
    <div className="story-panel">
      <StoryCard 
        story={story} 
        isVoiceMode={isVoiceMode}
        transformedStory={transformedStory}
        transformLabel={transformLabel}
        onClearTransform={onClearTransform}
        onStoryChange={onStoryChange}
      />

      <VariationSelector
        currentStory={transformedStory || story}
        onVariationApplied={onVariationApplied}
        disabled={isLoading}
      />
    </div>
  );
}

// Export
if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.StoryPanel = {
    PanelHeader,
    InfoTooltip,
    StoryCard,
    VariationSelector,
    StoryPanel
  };
}
