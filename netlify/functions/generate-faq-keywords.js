// ============================================
// GENERATE FAQ KEYWORDS
// Netlify Serverless Function
// Society Arts - FAQ Search Optimization
// ============================================
// 
// This function calls the Claude API to generate
// search-optimized keywords for FAQ entries.
//
// Endpoint: /.netlify/functions/generate-faq-keywords
// Method: POST
// Body: { question, answer, existingKeywords (optional) }
// ============================================

const Anthropic = require('@anthropic-ai/sdk');

// Generate the prompt for Claude
function generateKeywordPrompt(question, answer, existingKeywords = null) {
  const basePrompt = `You are a search optimization specialist for Society Arts, a creative platform that transforms personal memories into custom artwork.

Your task is to generate search keywords for an FAQ entry so users can find it easily when they search.

QUESTION:
${question}

ANSWER:
${answer}

${existingKeywords ? `EXISTING KEYWORDS:
${existingKeywords}

Review the existing keywords. Keep all that are still relevant. Add new keywords that would help users find this FAQ. Do not duplicate existing keywords. Merge existing with new into one comprehensive list.` : 'Generate a comprehensive list of keywords for this FAQ.'}

KEYWORD REQUIREMENTS:
1. Include the exact key terms from the question and answer
2. Add common synonyms (e.g., "delete" → "remove", "erase", "get rid of")
3. Include common misspellings of technical terms (e.g., "passowrd", "acount")
4. Add conceptual phrases users might search (e.g., "not working", "how do I", "can't find", "help with")
5. Include related technical terms and jargon variations
6. Add action words users might use (e.g., "fix", "solve", "help", "change", "update", "reset")
7. Include problem descriptions (e.g., "stuck", "broken", "error", "won't load")
8. Add platform-specific terms relevant to Society Arts (e.g., "artwork", "memory", "style", "art")
9. Keep all keywords lowercase
10. Aim for 25-50 keywords total for comprehensive coverage

OUTPUT FORMAT:
Return ONLY a comma-separated list of keywords on a single line. No explanations, no categories, no numbering, no line breaks within the list. Just the keywords separated by commas.

Example output format:
password, reset password, forgot password, change password, can't log in, login problem, locked out, new password, passowrd, signin, sign in, access account, lost password, password help`;

  return basePrompt;
}

exports.handler = async (event, context) => {
  // Handle CORS preflight - must come first
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { question, answer, existingKeywords } = JSON.parse(event.body);

    // Validate required fields
    if (!question || !answer) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: question and answer are required' 
        }),
      };
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'ANTHROPIC_API_KEY environment variable not set' 
        }),
      };
    }

    // Initialize Anthropic client
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Generate the prompt
    const prompt = generateKeywordPrompt(question, answer, existingKeywords);

    // Call Claude API
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract keywords from response
    const keywords = response.content[0].text.trim();

    // Clean up the keywords (ensure proper formatting)
    const cleanedKeywords = keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0)
      .filter((k, i, arr) => arr.indexOf(k) === i) // Remove duplicates
      .join(', ');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        keywords: cleanedKeywords,
        count: cleanedKeywords.split(',').length,
        mode: existingKeywords ? 'updated' : 'generated'
      }),
    };

  } catch (error) {
    console.error('Error generating keywords:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to generate keywords',
        details: error.message 
      }),
    };
  }
};
