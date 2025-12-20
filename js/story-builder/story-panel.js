/* ========================================
   SOCIETY ARTS - STORY PANEL
   Left sidebar for story display
   Version: 2.0
   ======================================== */

/**
 * Main Story Card Component
 */
function StoryCard({ story, isVoiceMode }) {
  return (
    <div className="card">
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <span className="card-title">Your Story</span>
        {isVoiceMode && <span className="badge badge-muted">🎤 Voice</span>}
      </div>
      <div className="card-content">
        {story ? (
          <p>{story}</p>
        ) : (
          <p className="card-placeholder">
            Your story will appear here — once you've shared a moment worth remembering.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Variation Card Component
 */
function VariationCard({ 
  label, 
  variation, 
  isSelected, 
  onSelect, 
  onGenerate, 
  isLoading,
  variationType,
  onTypeChange,
  variationTypes
}) {
  return (
    <div 
      className={`card card-clickable ${isSelected ? 'card-selected' : ''}`}
      onClick={onSelect}
    >
      <div className="card-header">
        <div className="radio-outer">
          {isSelected && <div className="radio-inner"></div>}
        </div>
        <span className="card-title">{label}</span>
        <button 
          className="btn btn-ghost btn-sm"
          style={{ marginLeft: 'auto', color: 'var(--color-highlight)' }}
          onClick={(e) => { 
            e.stopPropagation(); 
            onGenerate(); 
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Another take'} ▼
        </button>
      </div>
      
      {variationType && onTypeChange && variationTypes && (
        <div style={{ paddingLeft: '28px', marginTop: '8px' }} onClick={(e) => e.stopPropagation()}>
          <select 
            value={variationType}
            onChange={(e) => onTypeChange(e.target.value)}
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid var(--color-border-light)',
              backgroundColor: '#fff',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            {Object.values(variationTypes).map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {variation && (
        <div className="card-content" style={{ paddingLeft: '28px', marginTop: '10px' }}>
          <p>{variation}</p>
        </div>
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
  selectedVariation,
  onSelectVariation,
  variations,
  onGenerateVariation,
  isLoading,
  variationTypes,
  onVariationTypeChange,
  variationTypeOptions
}) {
  return (
    <div className="story-panel">
      <StoryCard story={story} isVoiceMode={isVoiceMode} />

      {story && (
        <>
          <VariationCard
            label="Variation A"
            variation={variations.A}
            isSelected={selectedVariation === 'A'}
            onSelect={() => onSelectVariation('A')}
            onGenerate={() => onGenerateVariation('A')}
            isLoading={isLoading}
            variationType={variationTypes?.A}
            onTypeChange={(type) => onVariationTypeChange?.('A', type)}
            variationTypes={variationTypeOptions}
          />

          <VariationCard
            label="Variation B"
            variation={variations.B}
            isSelected={selectedVariation === 'B'}
            onSelect={() => onSelectVariation('B')}
            onGenerate={() => onGenerateVariation('B')}
            isLoading={isLoading}
            variationType={variationTypes?.B}
            onTypeChange={(type) => onVariationTypeChange?.('B', type)}
            variationTypes={variationTypeOptions}
          />
        </>
      )}
    </div>
  );
}

// Export
if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.StoryPanel = {
    StoryCard,
    VariationCard,
    StoryPanel
  };
}
