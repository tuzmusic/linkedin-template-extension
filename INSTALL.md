# Quick Installation Guide

## Step-by-Step Installation

### 1. Open Chrome Extensions
- Type `chrome://extensions/` in your address bar, OR
- Click the three dots menu → More Tools → Extensions

### 2. Enable Developer Mode
- Look for the toggle switch in the top-right corner
- Turn ON "Developer mode"

### 3. Load the Extension
- Click the "Load unpacked" button that appears
- Navigate to and select the `linkedin-template-extension` folder
- Click "Select" or "Open"

### 4. Verify Installation
You should see:
- "LinkedIn Message Template" in your extensions list
- A blue "LT" icon in your Chrome toolbar (you may need to click the puzzle piece icon to pin it)

### 5. Set Up Your Template
- Click the extension icon in the toolbar
- Enter your message template (e.g., `Hi {{firstName}}, I'd love to connect!`)
- Click "Save Template"

## Quick Test

1. Go to any LinkedIn profile (e.g., a coworker or public profile)
2. Press `Cmd+.` (Mac) or `Ctrl+.` (Windows)
3. You should see a green toast notification saying "Message copied!"
4. Paste (`Cmd+V`) anywhere to see your personalized message

## Troubleshooting

**Extension doesn't appear after loading:**
- Make sure you selected the correct folder (the one containing `manifest.json`)
- Check the Chrome console for error messages
- Try refreshing the extensions page

**Keyboard shortcut doesn't work:**
- Make sure you're on a LinkedIn profile page (URL contains `/in/`)
- Check `chrome://extensions/shortcuts` to see if there's a conflict
- Try a different profile page

**Icons are missing/broken:**
- The extension should still work fine
- Icons are optional and only for visual appeal

## Next Steps

- Read the full [README.md](README.md) for detailed usage instructions
- Customize your template with wildcards
- Start sending personalized connection requests!

## Need Help?

If you encounter any issues, check:
1. Console errors: Right-click extension icon → Inspect popup → Console tab
2. Page errors: F12 on LinkedIn page → Console tab
3. Make sure you're using a recent version of Chrome
