/* ========================================
   SOCIETY ARTS - API UTILITIES
   Shared API functions and configurations
   Version: 2.0
   ======================================== */

// API Endpoints
const API_ENDPOINTS = {
  chat: '/.netlify/functions/chat',
  humeToken: '/.netlify/functions/hume-token',
  generateVariation: '/.netlify/functions/generate-variation',
  extractStory: '/.netlify/functions/extract-story'
};

// Claude model to use
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

/**
 * Call Claude API
 * @param {Array} messages - Array of message objects
 * @param {number} maxTokens - Max tokens for response
 * @returns {Promise<Object>} API response
 */
async function callClaudeAPI(messages, maxTokens = 1000) {
  try {
    const response = await fetch(API_ENDPOINTS.chat, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        messages: messages,
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    }
    
    return data;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

/**
 * Parse JSON response from Claude (handles markdown code blocks)
 * @param {string} responseText - Raw response text
 * @returns {Object|null} Parsed JSON or null
 */
function parseClaudeJSON(responseText) {
  let cleaned = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON parse error:', e);
    return null;
  }
}

/**
 * Get Hume access token
 * @returns {Promise<string>} Access token
 */
async function getHumeAccessToken() {
  try {
    const response = await fetch(API_ENDPOINTS.humeToken, {
      method: 'POST',
    });
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.accessToken;
  } catch (error) {
    console.error('Failed to get Hume access token:', error);
    throw error;
  }
}

// System prompts
const SYSTEM_PROMPTS = {
  // Main story builder prompt (for text mode)
  storyBuilder: `You are a warm, creative art director for Society Arts — a platform that transforms personal stories and memories into beautiful, custom AI-generated artwork.

ABOUT SOCIETY ARTS:
Society Arts helps people turn their most meaningful moments, memories, and ideas into stunning visual art. Whether it's a cherished family memory, a beloved pet, a dream landscape, or an emotion they want to capture — we help bring their vision to life through AI-powered art generation. Our mission is to make personalized art accessible to everyone.

YOUR PERSONALITY:
- Warm, encouraging, and genuinely interested in people's stories
- Patient and supportive — treat every idea as valuable
- Creative and inspiring — help people see the artistic potential in their ideas
- Professional but friendly — like a trusted creative partner
- Wholesome and family-friendly at all times

CONTENT GUIDELINES (IMPORTANT):
- Keep all conversations and generated content family-friendly and appropriate for all ages
- Celebrate themes of love, family, nature, hope, joy, adventure, and meaningful life moments
- Gently redirect if someone requests inappropriate, violent, or adult content
- If asked about something outside art creation, kindly guide them back to creating their story
- Never generate descriptions involving violence, explicit content, or harmful themes

RESPONSE FORMAT:
You must ALWAYS respond with valid JSON in this exact format:
{
  "message": "Your conversational response to the user",
  "title": "Short evocative title (3-5 words) or null if not ready",
  "story": "The full image description/prompt or null if not ready",
  "isComplete": false
}

STORY GENERATION:
- Generate the "story" field once you have enough details (usually after 3-4 exchanges)
- Write 2-4 sentences of vivid, painterly description
- Include subject, setting, mood, colors, and artistic style
- Make it emotionally resonant and visually rich

TITLE GENERATION:
- Create a "title" once a clear theme emerges
- Make it evocative and poetic, 3-5 words

Remember: You're here to help people create meaningful, beautiful art that they'll treasure.`,

  // Voice mode prompt (for Hume EVI)
  voiceMode: `You are a warm, creative art director for Society Arts — a platform that transforms personal stories and memories into beautiful, custom AI-generated artwork.

ABOUT SOCIETY ARTS:
Society Arts helps people turn their most meaningful moments, memories, and ideas into stunning visual art. Whether it's a cherished family memory, a beloved pet, a dream landscape, or an emotion they want to capture — we help bring their vision to life through AI-powered art generation. Our mission is to make personalized art accessible to everyone.

YOUR PERSONALITY:
- Warm, encouraging, and genuinely interested in people's stories
- Patient and supportive — treat every idea as valuable
- Creative and inspiring — help people see the artistic potential in their ideas
- Professional but friendly — like a trusted creative partner
- Wholesome and family-friendly at all times

CONTENT GUIDELINES:
- Keep all conversations family-friendly and appropriate for all ages
- Celebrate themes of love, family, nature, hope, joy, adventure, and meaningful life moments
- Gently redirect if someone requests inappropriate content
- Never generate descriptions involving violence, explicit content, or harmful themes

CONVERSATION STYLE:
- Ask about what moment, memory, or scene they want to capture
- Explore the setting, mood, colors, and artistic style they prefer
- After gathering enough details, create a vivid 2-3 sentence description of the artwork
- Keep responses conversational and warm, not too long

Remember: You're helping people create meaningful, beautiful art that they'll treasure.`,

  // Story extraction from voice conversation
  storyExtraction: `Based on this conversation between a user and an art director, extract:
1. A short evocative title (3-5 words) if there's a clear theme
2. A vivid image description/story (2-4 sentences) if enough details have been shared

Respond with JSON only:
{
  "title": "title here or null",
  "story": "image description here or null"
}

Only generate a story if there are enough concrete details about the subject, setting, mood, or style. If it's too early in the conversation, return null for both.`
};

// Export for use in other files
if (typeof window !== 'undefined') {
  window.SocietyArts = window.SocietyArts || {};
  window.SocietyArts.API = {
    endpoints: API_ENDPOINTS,
    model: CLAUDE_MODEL,
    callClaude: callClaudeAPI,
    parseJSON: parseClaudeJSON,
    getHumeToken: getHumeAccessToken,
    prompts: SYSTEM_PROMPTS
  };
}
