# Society Arts v2.0 - Modular Architecture

## Overview

This is the new modular architecture for Society Arts, transforming the single HTML file into a scalable, maintainable structure with separate pages, components, and stylesheets.

## What's New

### ✅ Modular File Structure
- Separate CSS files for different concerns (variables, components, header, modals)
- Separate JS files for different features (API, header, voice, styles, variations)
- Individual HTML pages for each feature

### ✅ Medium Matrix (14 Categories)
- 5 main categories: Painting, Drawing, Photography, Printmaking, Collage/Mixed Media
- 14 medium types with classification system
- Sample styles database with 20+ example styles

### ✅ Style Finder Page
- Full-page style browser with sidebar filters
- Category/medium expandable navigation
- Search functionality
- Style viewer modal with image gallery
- Favorites using localStorage (no auth required for testing)

### ✅ All Previous Features
- Voice mode (Hume EVI integration)
- Text chat with Claude
- Story generation and variations
- Format selector
- Help menu

---

## File Structure

```
society-arts-v2/
├── index.html              # Homepage
├── story-builder.html      # Main creation interface
├── style-finder.html       # Browse and select styles
├── netlify.toml            # Netlify configuration
│
├── css/
│   ├── variables.css       # Design tokens (colors, fonts, spacing)
│   ├── base.css            # Reset, utilities, animations
│   ├── components.css      # Buttons, cards, inputs, etc.
│   ├── header.css          # Header, nav sidebar, help menu
│   └── modals.css          # Style Finder & Viewer modals
│
├── js/
│   ├── shared/
│   │   ├── api.js          # Claude API, Hume token, prompts
│   │   └── header.js       # Header, nav, help menu components
│   ├── story-builder/
│   │   ├── voice.js        # Hume EVI integration
│   │   └── story-panel.js  # Story display components
│   ├── style-finder/
│   │   └── style-data.js   # Medium Matrix, sample styles, localStorage
│   └── variations/
│       └── variations.js   # Story variation generation
│
└── netlify/
    └── functions/
        ├── chat.js         # Claude API proxy
        └── hume-token.js   # Hume authentication
```

---

## Migration Instructions

### Step 1: Backup Your Current Site

Before making any changes, save a copy of your current `index.html` and any other files.

### Step 2: Prepare Your GitHub Repository

1. Go to your GitHub repository for Society Arts
2. Delete all existing files (or create a new branch for safety)

### Step 3: Upload New Files

**Option A: GitHub Web Interface**
1. Download the `society-arts-v2.zip` file
2. Extract it on your computer
3. In GitHub, click "Add file" → "Upload files"
4. Drag all the extracted files/folders into the upload area
5. Commit the changes

**Option B: Git Command Line**
```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/society-arts.git
cd society-arts

# Remove old files
rm -rf *

# Extract new files into the repo folder
# (copy contents of society-arts-v2 here)

# Commit and push
git add .
git commit -m "Upgrade to modular architecture v2.0"
git push origin main
```

### Step 4: Verify Netlify Deployment

1. Go to your Netlify dashboard
2. Wait for the new deployment to complete
3. Check the deploy log for any errors

### Step 5: Test the Site

Visit your Netlify URL and test:
- [ ] Homepage loads
- [ ] Navigation menu opens/closes
- [ ] Story Builder page loads
- [ ] Style Finder page loads
- [ ] Voice mode connects
- [ ] Text chat works
- [ ] Styles can be browsed and selected
- [ ] Favorites save/load (using localStorage)

---

## Environment Variables

Make sure these are set in Netlify:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude |
| `HUME_API_KEY` | Your Hume API key |
| `HUME_SECRET_KEY` | Your Hume secret key |

---

## Customization Guide

### Changing Colors

Edit `css/variables.css`:
```css
:root {
  --color-accent: #C75B3F;  /* Change brand color */
  --color-background: #F5F0EB;  /* Change background */
}
```

### Changing Fonts

Edit `css/variables.css`:
```css
:root {
  --font-serif: 'Your Font', Georgia, serif;
  --font-sans: 'Your Sans Font', sans-serif;
}
```

### Adding a New Style

Edit `js/style-finder/style-data.js` and add to `SAMPLE_STYLES` array:
```javascript
{
  id: '10100006',
  name: 'Your New Style',
  displayName: 'Painting Your New Style',
  categoryId: 'painting',
  mediumId: 'paint-bold',
  description: 'Description here...',
  tags: ['Tag1', 'Tag2'],
  aboutText: 'About text here...',
  palette: ['#color1', '#color2', '#color3', '#color4', '#color5'],
  thumbnail: 'https://your-image-url.jpg'
}
```

---

## Next Steps (Future Development)

### Phase 2: Core Components
- [ ] Enhanced help pages (`/pages/help/`)
- [ ] Projects list page
- [ ] Collections management

### Phase 3: Style System
- [ ] Import your 5,000 styles
- [ ] Cloudinary image hosting setup
- [ ] Style classification tool (AI-assisted)

### Phase 4: User Features
- [ ] User authentication (when ready)
- [ ] Persist favorites/collections to database
- [ ] Project saving/loading

---

## Support

If you encounter issues:

1. Check the browser console for errors (F12 → Console)
2. Verify all files uploaded correctly
3. Check Netlify deploy logs
4. Ensure environment variables are set

---

## Version History

- **v2.0** - Modular architecture, Style Finder, Medium Matrix
- **v1.0** - Single HTML file with voice integration
