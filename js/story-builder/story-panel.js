/* ========================================
   SOCIETY ARTS - STORY PANEL
   Left sidebar for story display
   Version: 4.0
   ======================================== */

/**
 * Info Tooltip Component
 */
function StoryInfoTooltip({ show, onClose }) {
  if (!show) return null;
  
  return (
    <div className="story-info-tooltip">
      <div className="story-info-content">
        <h4>Your Story</h4>
        <p>This box captures your story as you share it through voice or text conversation.</p>
        <ul>
          <li><strong>Auto-populates</strong> as you tell your story</li>
          <li><strong>Editable</strong> — type directly or refine any words</li>
        </ul>
        <button className="story-info-close" onClick={onClose}>Got it</button>
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

  // Icons
  const InfoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );

  return (
    <div className="card story-card">
      <div className="card-header">
        <span className="card-title">Your Story</span>
        <div className="story-card-actions">
          {isVoiceMode && <span className="badge badge-muted">🎤 Voice</span>}
          {isTransformed && (
            <span className="badge badge-accent">{transformLabel}</span>
          )}
          <button 
            className={`story-action-btn ${showInfo ? 'active' : ''}`}
            onClick={() => setShowInfo(!showInfo)}
            title="About this panel"
          >
            <InfoIcon />
          </button>
        </div>
      </div>
      
      <StoryInfoTooltip show={showInfo} onClose={() => setShowInfo(false)} />
      
      <div className="card-content">
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
 * Variation Selector Component (integrated from variations.js)
 */
function VariationSelector({ currentStory, onVariationApplied, disabled }) {
  const [variations, setVariations] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(null);

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
      <div className="variation-label">Transform Your Story</div>
      <div className="variation-buttons">
        {variationList.map((variation) => (
          <button
            key={variation.id}
            className={`variation-btn ${generating === variation.id ? 'generating' : ''}`}
            onClick={() => handleVariationClick(variation.id)}
            disabled={disabled || !currentStory || generating}
            title={variation.description}
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
        ))}
      </div>
      {!currentStory && (
        <div className="variation-hint">Share your story first to unlock variations</div>
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
    StoryCard,
    VariationSelector,
    StoryPanel
  };
}
