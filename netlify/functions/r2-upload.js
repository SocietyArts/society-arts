/* ========================================
   SOCIETY ARTS - R2 STYLE UPLOAD FUNCTION
   SuperAdmin utility for uploading style folders to CloudFlare R2
   Version: 1.1 - Added Supabase validation
   ======================================== */

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = 'society-arts-styles';

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yspxlhcebcijeuemkaed.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Initialize Supabase client (only if credentials available)
const supabase = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

// Initialize S3 client for R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Style ID pattern: 3 uppercase letters + hyphen + 2 digits (e.g., ABF-49)
const STYLE_ID_PATTERN = /^[A-Z]{3}-\d{2}$/;

// File naming pattern: StyleID-00.webp through StyleID-09.webp
const FILE_PATTERN = /^[A-Z]{3}-\d{2}-0[0-9]\.webp$/;

/**
 * Validate a style folder's files
 * @param {string} styleId - The style ID (e.g., ABF-49)
 * @param {Array} files - Array of file objects with name and data
 * @returns {Object} - Validation result with valid flag and errors array
 */
function validateStyleFolder(styleId, files) {
  const errors = [];
  
  // Validate style ID format
  if (!STYLE_ID_PATTERN.test(styleId)) {
    errors.push(`Invalid Style ID format: "${styleId}". Expected format: AAA-## (e.g., ABF-49)`);
    return { valid: false, errors };
  }
  
  // Filter to only WEBP files that match the expected naming pattern
  const validFiles = files.filter(f => {
    const expectedPattern = new RegExp(`^${styleId}-0[0-9]\\.webp$`);
    return expectedPattern.test(f.name);
  });
  
  // Check for exactly 10 valid files
  if (validFiles.length !== 10) {
    errors.push(`Expected 10 WEBP files matching pattern ${styleId}-0#.webp, found ${validFiles.length}`);
  }
  
  // Check for each specific file (00-09)
  const expectedFiles = [];
  for (let i = 0; i < 10; i++) {
    expectedFiles.push(`${styleId}-0${i}.webp`);
  }
  
  const foundFiles = validFiles.map(f => f.name);
  const missingFiles = expectedFiles.filter(f => !foundFiles.includes(f));
  
  if (missingFiles.length > 0) {
    errors.push(`Missing files: ${missingFiles.join(', ')}`);
  }
  
  // Check for duplicates
  const duplicates = foundFiles.filter((f, i) => foundFiles.indexOf(f) !== i);
  if (duplicates.length > 0) {
    errors.push(`Duplicate files detected: ${duplicates.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    validFiles: validFiles.map(f => f.name)
  };
}

/**
 * Check if a style already exists in R2
 * @param {string} styleId - The style ID to check
 * @returns {boolean} - True if style exists
 */
async function styleExistsInR2(styleId) {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: `${styleId}/${styleId}-00.webp`,
    });
    await r2Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Check if a style exists in Supabase database
 * @param {string} styleId - The style ID to check
 * @returns {Object} - { exists: boolean, record: object|null, error: string|null }
 */
async function styleExistsInSupabase(styleId) {
  if (!supabase) {
    return { exists: null, record: null, error: 'Supabase not configured' };
  }
  
  try {
    const { data, error } = await supabase
      .from('styles')
      .select('id, style_id, title')
      .eq('style_id', styleId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No rows returned - style doesn't exist
      return { exists: false, record: null, error: null };
    }
    
    if (error) {
      return { exists: null, record: null, error: error.message };
    }
    
    return { exists: true, record: data, error: null };
  } catch (err) {
    return { exists: null, record: null, error: err.message };
  }
}

/**
 * Upload a single file to R2
 * @param {string} styleId - The style ID (folder name)
 * @param {string} fileName - The file name
 * @param {Buffer} fileData - The file data as a buffer
 * @returns {Object} - Upload result
 */
async function uploadFileToR2(styleId, fileName, fileData) {
  const key = `${styleId}/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileData,
    ContentType: 'image/webp',
  });
  
  await r2Client.send(command);
  
  return {
    success: true,
    key,
    url: `https://pub-acb560f551f141db830964aed1fa005f.r2.dev/${key}`
  };
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Check for required environment variables
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'R2 credentials not configured',
          missing: {
            R2_ACCOUNT_ID: !R2_ACCOUNT_ID,
            R2_ACCESS_KEY_ID: !R2_ACCESS_KEY_ID,
            R2_SECRET_ACCESS_KEY: !R2_SECRET_ACCESS_KEY,
          }
        }),
      };
    }

    const body = JSON.parse(event.body);
    const { action, styleId, files, overwrite } = body;

    // Action: validate - Check files before uploading
    if (action === 'validate') {
      if (!styleId || !files || !Array.isArray(files)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing styleId or files array' }),
        };
      }

      const validation = validateStyleFolder(styleId, files);
      const existsInR2 = await styleExistsInR2(styleId);
      const supabaseCheck = await styleExistsInSupabase(styleId);
      
      // Build warnings array
      const warnings = [];
      if (supabaseCheck.exists === false) {
        warnings.push(`Style ID "${styleId}" not found in database. You can still upload, but remember to add it to Supabase later.`);
      } else if (supabaseCheck.error) {
        warnings.push(`Could not check database: ${supabaseCheck.error}`);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          styleId,
          validation,
          existsInR2,
          existsInSupabase: supabaseCheck.exists,
          supabaseRecord: supabaseCheck.record,
          warnings,
          canUpload: validation.valid && (!existsInR2 || overwrite),
        }),
      };
    }

    // Action: upload - Upload validated files
    if (action === 'upload') {
      if (!styleId || !files || !Array.isArray(files)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing styleId or files array' }),
        };
      }

      // Re-validate before upload
      const validation = validateStyleFolder(styleId, files);
      if (!validation.valid) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Validation failed',
            validation,
          }),
        };
      }

      // Check if exists (unless overwrite is true)
      const exists = await styleExistsInR2(styleId);
      if (exists && !overwrite) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            error: 'Style already exists in R2',
            styleId,
            existsInR2: true,
            hint: 'Set overwrite: true to replace existing files',
          }),
        };
      }

      // Upload each file
      const results = [];
      const errors = [];

      for (const file of files) {
        // Only upload valid files
        const expectedPattern = new RegExp(`^${styleId}-0[0-9]\\.webp$`);
        if (!expectedPattern.test(file.name)) {
          continue; // Skip non-matching files
        }

        try {
          // File data should be base64 encoded
          const fileBuffer = Buffer.from(file.data, 'base64');
          const result = await uploadFileToR2(styleId, file.name, fileBuffer);
          results.push(result);
        } catch (uploadError) {
          errors.push({
            file: file.name,
            error: uploadError.message,
          });
        }
      }

      return {
        statusCode: errors.length > 0 ? 207 : 200,
        headers,
        body: JSON.stringify({
          success: errors.length === 0,
          styleId,
          uploaded: results.length,
          results,
          errors: errors.length > 0 ? errors : undefined,
        }),
      };
    }

    // Action: check - Check if a style exists
    if (action === 'check') {
      if (!styleId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing styleId' }),
        };
      }

      const exists = await styleExistsInR2(styleId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          styleId,
          exists,
        }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Invalid action',
        validActions: ['validate', 'upload', 'check'],
      }),
    };

  } catch (error) {
    console.error('R2 Upload Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};
