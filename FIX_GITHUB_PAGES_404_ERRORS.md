# Fix for GitHub Pages 404 Errors

## Problem
The main index.html has broken links for "Get Started" and "Read Documentation" buttons.

## Root Cause
1. The index.html references `typescript-eda/` directory which doesn't exist
2. The relative paths in the links don't match the actual directory structure

## Current Structure
```
docs/
├── index.html (main page)
├── chatgpt-buddy/
│   ├── index.html
│   ├── getting-started.html
│   └── story.html
├── web-buddy/
│   ├── index.html
│   ├── getting-started.html
│   └── story.html
└── (no typescript-eda directory)
```

## Solution

### Option 1: Create Missing typescript-eda Directory
Create a `typescript-eda` directory with the required files:
- index.html
- getting-started.html
- story.html

### Option 2: Update Links in index.html
Change the broken links to point to existing documentation:
- Replace `typescript-eda/` with appropriate existing paths
- Or create a simple landing page that redirects

### Option 3: Create Redirect Pages
Create minimal HTML files that redirect to the correct locations.

## Immediate Fix Needed

The following links in `/docs/index.html` are broken:

Line 284: `<a href="typescript-eda/" class="btn btn-primary">📖 Documentation</a>`
Line 285: `<a href="typescript-eda/getting-started.html" class="btn btn-secondary">🚀 Quick Start</a>`
Line 286: `<a href="typescript-eda/story.html" class="btn btn-secondary">📚 Story</a>`

These need to either:
1. Point to existing documentation
2. Have the corresponding files created
3. Be removed/updated to reflect current structure

## Recommendation

Since this appears to be the Semantest project (not typescript-eda), update the links to point to Semantest documentation:
- Change `typescript-eda/` to appropriate Semantest paths
- Update the project name and descriptions accordingly