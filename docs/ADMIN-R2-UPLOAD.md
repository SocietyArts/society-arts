# Admin Utilities - Upload Styles to Society Arts™

## Overview

The "Upload Styles to Society Arts™" utility allows SuperAdmin users to upload style folders directly to CloudFlare R2 from the Settings page. This eliminates the need to use rclone from the command line.

## Requirements

### Environment Variables

Add these to your Netlify site's environment variables (Site Settings → Environment Variables):

```
R2_ACCOUNT_ID=<your-cloudflare-account-id>
R2_ACCESS_KEY_ID=<your-r2-access-key-id>
R2_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
```

**Optional - For database validation:**
```
SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>
```

**Where to find these:**

1. **R2_ACCOUNT_ID**: CloudFlare Dashboard → R2 Overview → Right sidebar shows "Account ID"
2. **R2_ACCESS_KEY_ID** and **R2_SECRET_ACCESS_KEY**: 
   - CloudFlare Dashboard → R2 → Manage R2 API Tokens
   - Create a new API token with "Object Read & Write" permissions
   - Copy the Access Key ID and Secret Access Key
3. **SUPABASE_SERVICE_KEY** (optional):
   - Supabase Dashboard → Settings → API → Service Role Key
   - Enables validation to warn if Style ID doesn't exist in database

### User Role

Only users with `role: 'super_admin'` in the `user_profiles` table can access the Admin Utilities section.

## How It Works

### Database Validation (Optional)

If `SUPABASE_SERVICE_KEY` is configured, the upload will:
- Check if the Style ID exists in the `styles` table
- Show a **warning** (yellow banner) if the Style ID isn't in the database
- Still allow the upload to proceed - it won't block you
- Remind you to add the style to Supabase later

This is a "warn but allow" approach - you maintain flexibility while being kept informed.

## How It Works

### File Structure Expected

Each style folder must contain exactly 10 WEBP files following this naming convention:

```
ABF-49/
  ├── ABF-49-00.webp
  ├── ABF-49-01.webp
  ├── ABF-49-02.webp
  ├── ABF-49-03.webp
  ├── ABF-49-04.webp
  ├── ABF-49-05.webp
  ├── ABF-49-06.webp
  ├── ABF-49-07.webp
  ├── ABF-49-08.webp
  └── ABF-49-09.webp
```

### Style ID Format

- 3 uppercase letters
- Hyphen
- 2 digits

Examples: `ABF-49`, `XYZ-01`, `MNO-99`

### Upload Process

1. Navigate to Settings page
2. Scroll to "Admin Utilities" section (visible only to SuperAdmins)
3. Click "Upload Styles to Society Arts™"
4. Drag folders onto the drop zone OR click to select folders
5. The system validates:
   - Style ID format
   - Presence of all 10 required WEBP files
   - Correct file naming
   - Whether the Style ID exists in the database (warning only)
6. Invalid folders are marked with errors
7. Click "Upload" to send valid folders to R2
8. During upload:
   - Overall progress bar shows total completion
   - Countdown timer estimates remaining time
   - Current folder is highlighted and auto-scrolled into view
   - Individual progress shown per folder
9. When complete:
   - Summary shows successful/failed counts
   - Option to receive email confirmation with detailed report

### Features

- **Drag & Drop**: Drag multiple folders at once
- **Folder Selection**: Click to use native folder picker
- **Smart Filtering**: Only WEBP files matching the pattern are uploaded; other files are ignored
- **Validation**: Client-side AND server-side validation
- **Overwrite Option**: Choose to replace existing styles or skip them
- **Overall Progress Bar**: Shows total upload progress across all folders
- **Countdown Timer**: Estimates remaining time based on upload speed
- **Auto-Scroll**: Automatically scrolls to the currently uploading folder
- **Email Confirmation**: Option to receive detailed upload report via email
- **Database Validation**: Warns if Style ID isn't in the Supabase database

## R2 Bucket Structure

Files are uploaded to the `society-arts-styles` bucket with this structure:

```
society-arts-styles/
  ├── ABF-49/
  │   ├── ABF-49-00.webp
  │   ├── ABF-49-01.webp
  │   └── ...
  ├── ABN-33/
  │   ├── ABN-33-00.webp
  │   └── ...
  └── ...
```

Public URL pattern: `https://pub-acb560f551f141db830964aed1fa005f.r2.dev/{StyleID}/{StyleID}-{00-09}.webp`

## Troubleshooting

### "R2 credentials not configured"
- Ensure all three environment variables are set in Netlify
- Redeploy after adding environment variables

### "Style already exists in R2"
- Check the "Overwrite existing styles" checkbox to replace
- Or use a different Style ID

### Files not appearing after upload
- Check CloudFlare R2 dashboard to verify upload
- Clear browser cache and refresh
- Verify the files are WEBP format

### Invalid folder errors
- Ensure folder name starts with valid Style ID (e.g., `ABF-49`)
- Check that all 10 files are present with correct naming
- Verify files are `.webp` format (not `.png` or `.jpg`)

## API Endpoints

The upload uses a Netlify serverless function at `/.netlify/functions/r2-upload` with these actions:

- `validate`: Check folder contents before uploading
- `upload`: Upload validated files to R2
- `check`: Check if a style already exists
- `send-report`: Send email confirmation of upload (requires SendGrid configuration)

### Email Configuration (Optional)

To enable email confirmations, add these environment variables:

```
SENDGRID_API_KEY=<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=noreply@societyarts.com
```

## Security

- Only SuperAdmin users can access the upload interface
- Environment variables are never exposed to the client
- Server-side validation prevents malicious uploads
- CORS is configured for the Society Arts domain
