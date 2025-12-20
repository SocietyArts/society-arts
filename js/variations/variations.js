/* ========================================
   SOCIETY ARTS - VARIATIONS
   Story variation generation
   Version: 2.0
   ======================================== */

// Variation types configuration
const VARIATION_TYPES = {
  subtle: {
    id: 'subtle',
    label: 'Subtle Refinement',
    description: 'Minor adjustments to enhance the scene',
    intensity: 0.3,
    prompt: `Take this image description and create a subtle variation. Keep almost everything the same, but make small refinements - perhaps adjust lighting slightly, add a minor detail, or shift emphasis to a different element. The changes should be noticeable but not dramatic.`
  },
  mood: {
    id: 'mood',
    label: 'Mood Shift',
    description: 'Same scene with different emotional tone',
    intensity: 0.5,
    prompt: `Take this image description and create a variation with a shifted mood or emotional tone. Keep the core subject and setting, but change the atmosphere - make it more peaceful, energetic, nostalgic, hopeful, or contemplative. The scene should feel emotionally different while remaining recognizable.`
  },
  perspective: {
    id: 'perspective',
    label: 'New Perspective',
    description: 'Different viewpoint or angle',
    intensity: 0.5,
    prompt: `Take this image description and reimagine it from a different perspective or viewpoint. Perhaps view the scene from above, below, closer, further away, or from a different character's point of view. Keep the core elements but present them in a fresh way.`
  },
  timeOfDay: {
    id: 'timeOfDay',
    label: 'Time of Day',
    description: 'Same scene at different time',
    intensity: 0.4,
    prompt: `Take this image description and recreate the scene at a different time of day. If it's daytime, make it golden hour, twilight, or night. If it's night, make it dawn or midday. Adjust all the lighting, colors, and atmosphere accordingly while keeping the subject and composition.`
  },
  season: {
    id: 'season',
    label: 'Season Change',
    description: 'Different season or weather',
    intensity: 0.5,
    prompt: `Take this image description and transform it to a different season or weather condition. Add snow, autumn leaves, spring blossoms, or summer sunshine. Adjust colors and atmosphere to match the new season while keeping the core subject and meaning.`
  },
  artistic: {
    id: 'artistic',
    label: 'Artistic Reimagining',
    description: 'Different artistic style',
    intensity: 0.6,
    prompt: `Take this image description and reimagine it in a different artistic style. If it's painterly, make it more impressionistic or expressionistic. If it's realistic, add dreamlike or fantastical elements. Keep the subject and emotion, but transform the artistic approach.`
  },
  dramatic: {
    id: 'dramatic',
    label: 'Dramatic Change',
    description: 'Significant creative reinterpretation',
    intensity: 0.8,
    prompt: `Take this image description and create a dramatically different interpretation. Keep the core emotional meaning and subject, but feel free to significantly change the setting, perspective, style, or atmosphere. Be creative and bold while staying true to the story's essence.`
  }
};

const DEFAULT_VARIATION_TYPE = 'mood';

/**
 * Generate a variation of the story
 */
async function generateVariation(originalStory, variationType = DEFAULT_VARIATION_TYPE, customPrompt = null) {
  const { API } = window.SocietyArts;
  
  const variationConfig = VARIATION_TYPES[variationType] || VARIATION_TYPES[DEFAULT_VARIATION_TYPE];
  const prompt = customPrompt || variationConfig.prompt;
  
  const fullPrompt = `${prompt}

Keep it wholesome and family-friendly.

Original description: "${originalStory}"

Respond with ONLY the new description text, no explanation, no quotes, no JSON. Write 2-4 sentences.`;

  try {
    const data = await API.callClaude([{
      role: 'user',
      content: fullPrompt
    }], 500);
    
    if (data.content && data.content[0]) {
      return {
        success: true,
        variation: data.content[0].text.trim(),
        type: variationType,
        intensity: variationConfig.intensity
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
async function generateMultipleVariations(originalStory, types = ['mood', 'perspective']) {
  const results = await Promise.all(
    types.map(type => generateVariation(originalStory, type))
  );
  
  return results.reduce((acc, result, index) => {
    acc[types[index]] = result;
    return acc;
  }, {});
}

// Export
if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.Variations = {
    TYPES: VARIATION_TYPES,
    DEFAULT_TYPE: DEFAULT_VARIATION_TYPE,
    generate: generateVariation,
    generateMultiple: generateMultipleVariations
  };
}
