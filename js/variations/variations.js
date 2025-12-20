/* ========================================
   SOCIETY ARTS - VARIATIONS
   Config-driven story variations
   Version: 3.0
   ======================================== */

// Cache for loaded configuration
let variationsConfig = null;
let configLoaded = false;

/**
 * Load variations configuration from JSON file
 */
async function loadConfig() {
  if (configLoaded && variationsConfig) {
    return variationsConfig;
  }
  
  try {
    const response = await fetch('/config/variations.json');
    if (!response.ok) {
      throw new Error('Failed to load variations config');
    }
    variationsConfig = await response.json();
    configLoaded = true;
    console.log('Variations config loaded:', Object.keys(variationsConfig.variations));
    return variationsConfig;
  } catch (error) {
    console.error('Error loading variations config:', error);
    // Return fallback config
    return getFallbackConfig();
  }
}

/**
 * Fallback configuration if JSON fails to load
 */
function getFallbackConfig() {
  return {
    variations: {
      optimize: {
        id: 'optimize',
        label: 'Optimize',
        description: 'Clean up my description for better results',
        icon: 'sparkles',
        instructions: 'Distill this story into a concise, effective prompt. Remove redundancy, keep core emotion and subject. 2-3 sentences maximum.'
      },
      enrich: {
        id: 'enrich',
        label: 'Enrich',
        description: 'Add artistic depth to my idea',
        icon: 'palette',
        instructions: 'Enhance this story with artistic details: lighting, mood, composition, color palette, atmosphere. Keep the original vision but make it more vivid.'
      },
      simplify: {
        id: 'simplify',
        label: 'Simplify',
        description: 'Strip it down to the essentials',
        icon: 'minimize',
        instructions: 'Reduce to essential elements. One subject, one mood. 1-2 sentences maximum. Minimalist but emotionally resonant.'
      },
      removePeople: {
        id: 'removePeople',
        label: 'Remove People',
        description: 'Take out human figures',
        icon: 'userMinus',
        instructions: 'Remove all human figures while preserving the scene, mood, and atmosphere. Focus on environment, objects, and nature.'
      }
    },
    settings: {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 500,
      temperature: 0.7
    }
  };
}

/**
 * Get all available variation types
 */
async function getVariationTypes() {
  const config = await loadConfig();
  return config.variations;
}

/**
 * Get a specific variation configuration
 */
async function getVariationType(typeId) {
  const config = await loadConfig();
  return config.variations[typeId] || null;
}

/**
 * Generate a variation of the story
 */
async function generateVariation(originalStory, variationType) {
  const { API } = window.SocietyArts;
  const config = await loadConfig();
  
  const variationConfig = config.variations[variationType];
  if (!variationConfig) {
    return {
      success: false,
      error: `Unknown variation type: ${variationType}`,
      type: variationType
    };
  }
  
  const fullPrompt = `${variationConfig.instructions}

Keep the result wholesome and family-friendly.

User's story: "${originalStory}"

Respond with ONLY the modified story text. No explanations, no quotes, no labels, no JSON.`;

  try {
    const data = await API.callClaude([{
      role: 'user',
      content: fullPrompt
    }], config.settings?.maxTokens || 500);
    
    if (data.content && data.content[0]) {
      return {
        success: true,
        variation: data.content[0].text.trim(),
        type: variationType,
        label: variationConfig.label
      };
    }
    
    throw new Error('No response content');
  } catch (error) {
    console.error('Variation generation error:', error);
    return {
      success: false,
      error: error.message,
      type: variationType
    };
  }
}

/**
 * Generate multiple variations at once
 */
async function generateMultipleVariations(originalStory, types) {
  const results = await Promise.all(
    types.map(type => generateVariation(originalStory, type))
  );
  
  return results.reduce((acc, result, index) => {
    acc[types[index]] = result;
    return acc;
  }, {});
}

// ========================================
// VARIATION SELECTOR COMPONENT
// ========================================

function VariationSelector({ onSelect, disabled, currentStory }) {
  const [variations, setVariations] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(null);

  // Load config on mount
  React.useEffect(() => {
    loadConfig().then(config => {
      setVariations(config.variations);
      setLoading(false);
    });
  }, []);

  const handleVariationClick = async (typeId) => {
    if (!currentStory || generating) return;
    
    setGenerating(typeId);
    
    const result = await generateVariation(currentStory, typeId);
    
    setGenerating(null);
    
    if (result.success && onSelect) {
      onSelect(result);
    } else if (!result.success) {
      console.error('Variation failed:', result.error);
      // Could show error toast here
    }
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

// ========================================
// EXPORTS
// ========================================

if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.Variations = {
    loadConfig,
    getTypes: getVariationTypes,
    getType: getVariationType,
    generate: generateVariation,
    generateMultiple: generateMultipleVariations,
    VariationSelector
  };
}
