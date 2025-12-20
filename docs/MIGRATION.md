# Society Arts v2 - Modular Architecture

## Overview

This package contains the new modular structure for Society Arts, separating the monolithic index.html into organized, maintainable components.

## File Structure

```
society-arts-v2/
├── index.html                    # Homepage
├── story-builder.html            # Main creation interface
├── style-finder.html             # Browse and select styles
├── netlify.toml                  # Netlify configuration
│
├── css/
│   ├── variables.css             # Design tokens (colors, fonts, spacing)
│   ├── base.css                  # Reset, utilities, animations
│   ├── components.css            # Buttons, cards, inputs, etc.
│   ├── header.css                # Header, nav, footer, help menu
│   └── modals.css                # Modal windows, Style Finder, Style Viewer
│
├── js/
│   ├── shared/
│   │   ├── api.js                # Claude API, Hume token, prompts
│   │   └── header.js             # Header, nav, help menu components
│   ├── story-builder/
│   │   ├── voice.js              # Hume EVI integration
│   │   └── story-panel.js        # Story display sidebar
│   ├── style-finder/
│   │   └── style-data.js         # Medium Matrix, sample styles, localStorage
│   └── variations/
│       └── variations.js         # Story variation generation
│
├── netlify/
│   └── functions/
│       ├── chat.js               # Claude API proxy
│       └── hume-token.js         # Hume authentication
│
└── docs/
    └── MIGRATION.md              # This file
```

## Migration Instructions

### Step 1: Backup Your Current Site

Before making any changes, backup your current GitHub repository:

1. Go to your GitHub repository
2. Click "Code" → "Download ZIP"
3. Save this backup somewhere safe

### Step 2: Prepare Your Repository

Option A - Clean replacement (recommended for test sites):

1. Go to your GitHub repository
2. Delete ALL existing files (except .git folder if visible)
3. Upload all contents from this ZIP file

Option B - Gradual migration:

1. Create a new branch: `git checkout -b modular-v2`
2. Delete old index.html
3. Upload new files
4. Test thoroughly
5. Merge to main when ready

### Step 3: Upload New Files

1. Extract the society-arts-v2.zip file
2. Go to your GitHub repository
3. Click "Add file" → "Upload files"
4. Drag all files and folders from the extracted ZIP
5. Commit with message: "Migrate to modular architecture v2"

### Step 4: Configure Netlify Environment Variables

Ensure these are set in Netlify (Site settings → Environment variables):

```
ANTHROPIC_API_KEY=your-key-here
HUME_API_KEY=your-key-here
HUME_SECRET_KEY=your-secret-here
```

### Step 5: Verify Deployment

After Netlify deploys (usually 1-2 minutes):

1. Visit your site homepage - should show welcome page
2. Click "Start Creating" - should load Story Builder
3. Click hamburger menu - should slide out navigation
4. Test voice mode (click microphone)
5. Click "Browse Styles" or go to /style-finder

## Key Changes from Previous Version

### What's New

1. **Modular CSS** - Change `--color-accent` in variables.css to update the entire site
2. **Separate Pages** - Homepage, Story Builder, and Style Finder are now separate HTML files
3. **Reusable Components** - Header, Footer, Help Menu work across all pages
4. **Medium Matrix** - 14 style categories organized in 5 main groups
5. **Local Storage** - Favorites and collections work without authentication
6. **Style Finder** - Full browse/filter/search interface for styles

### Breaking Changes

- Old single index.html is replaced by multiple files
- CSS classes may have changed names
- JavaScript is now organized in separate files

## Testing Checklist

- [ ] Homepage loads with hero section
- [ ] "Start Creating" navigates to Story Builder
- [ ] Hamburger menu opens/closes
- [ ] Help menu (? button) shows 9 items
- [ ] Voice mode connects to Hume
- [ ] Text chat works with Claude
- [ ] Story extraction works
- [ ] Format selector dropdown works
- [ ] Style cards display and are clickable
- [ ] Style Finder page loads
- [ ] Category filters expand/collapse
- [ ] Medium checkboxes filter styles
- [ ] Search filters styles
- [ ] Favorites persist (localStorage)
- [ ] Style Viewer modal opens

## Customization Guide

### Change Brand Colors

Edit `css/variables.css`:

```css
--color-accent: #C75B3F;        /* Main accent (terracotta) */
--color-button-primary: #8B7355; /* Button brown */
```

### Change Fonts

Edit `css/variables.css`:

```css
--font-serif: 'Cormorant Garamond', Georgia, serif;
--font-sans: 'Source Sans 3', sans-serif;
```

### Add New Styles

Edit `js/style-finder/style-data.js` and add to `SAMPLE_STYLES` array.

### Add New Navigation Items

Edit `js/shared/header.js` and modify `NAV_ITEMS` array.

## Troubleshooting

### Site shows blank page
- Check browser console for JavaScript errors
- Ensure all files uploaded correctly
- Verify file paths match structure

### Voice mode doesn't work
- Check Hume API keys in Netlify environment variables
- Ensure microphone permissions granted
- Check browser console for connection errors

### Styles don't load
- Check that js/style-finder/style-data.js uploaded correctly
- Check browser console for errors

### CSS not applying
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Verify CSS files are in /css/ folder

## Next Steps

After successful migration:

1. Add more sample styles to style-data.js
2. Customize colors/fonts in variables.css
3. Add real style images (currently using Unsplash placeholders)
4. Connect to Cloudinary for image hosting
5. Add authentication when ready for production

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all files uploaded correctly
3. Check Netlify deploy logs
4. Compare file structure with this README
