# Release Notes - Version 0.2.0

**Release Date:** March 10, 2026
**Branch:** `release/all-features-v2-with-fixes`
**Total Commits:** 25
**Previous Version:** 0.1.1

---

## Overview

This release introduces powerful new features for message composition and includes numerous bug fixes and UI improvements. The extension now supports dynamic message targeting through wildcards and offers better keyboard shortcut integration.

---

## New Features

### 1. Message Target Wildcards 🎯
Dynamically target your messages to specific profiles with a new wildcard system that works alongside template variables.

**What's New:**
- Add custom wildcards to define dynamic message targets
- Visual UI for managing and displaying available wildcards
- Supports flexible pattern matching for different profile types
- Interactive wildcard insertion (click to add to templates)

**Files Modified:**
- `popup.html` - Added wildcard management UI section
- `popup.js` - Implemented wildcard functionality and click handlers
- `content.js` - Enhanced data extraction logic

**Commits:**
- `7665ea7` - Add message target wildcards UI
- `516b5e5` - Add message target wildcards functionality

### 2. Click-Send Keyboard Shortcut ⌨️
New keyboard shortcut to automatically click the Send button on connection request notes.

**What's New:**
- **Command:** `click-send`
- **Default Shortcut:** `Shift+Alt+S` (Windows/Linux) or `Shift+Option+S` (Mac)
- Automatically executes the send action on LinkedIn's connection note dialog
- Streamlines the connection request workflow

**Files Modified:**
- `manifest.json` - Added `click-send` command definition
- `background.js` - Added send button click handler
- `content.js` - Implemented send button detection and clicking logic

**Commits:**
- `016ad6d` - Add click-send command with Option+S shortcut

---

## Bug Fixes

### Company Name Detection
Fixed an issue where the `{{companyName}}` wildcard was not being extracted correctly from LinkedIn profiles.

**Impact:** The wildcard now reliably captures the current company name for template personalization.

**Commits:**
- `dafcc6d` - Fix finding companyname!

### Connect Button Click Issues
Resolved issues where the Connect button click command was not working reliably.

**Impact:** The `click-connect` command now works consistently across different LinkedIn profile layouts.

**Commits:**
- `f92b06b` - Fix connect button click

### Clipboard API Error
Fixed errors occurring when using keyboard shortcuts to copy templates to clipboard.

**Impact:** Keyboard shortcuts now work smoothly without console errors.

**Commits:**
- `6c31ca9` - Fix clipboard API error in keyboard shortcut

### UI and Keyboard Shortcut Issues
Comprehensive fix for multiple UI rendering and keyboard shortcut interaction problems.

**Impact:** Better overall stability and user experience with keyboard commands.

**Commits:**
- `1f3402e` - Fix: resolve UI and keyboard shortcut issues

### Template Selection State
Fixed bug where selecting a template didn't update the UI state until after saving.

**Impact:** Templates now show as selected immediately upon clicking.

**Commits:**
- `0c59769` - Fix template selection not updating when switching templates

### Missing DOM Element References
Added missing references for DOM elements, preventing undefined errors in popup functionality.

**Impact:** Improved stability and reduced console errors.

**Commits:**
- `4988bac` - Fix: add missing DOM element references at top of popup.js

### Missing filterTemplates Function
Implemented missing template filtering function that was causing search to fail.

**Impact:** Template search functionality is now fully operational.

**Commits:**
- `3f280f5` - Fix: add missing filterTemplates function implementation

### Background Styling
Restored correct background styling for "no results" message in template search.

**Impact:** Better visual consistency and readability of search results.

**Commits:**
- `6bd5da9` - Restore background styling for no-results message

---

## UI/UX Improvements

### 1. Enhanced Toggle and Layout
- Reduced toggle button size for better visual balance
- Improved spacing between wildcard headers and lists
- Better overall visual hierarchy

**Commits:**
- `b3edf43` - Make toggle smaller
- `c81196c` - Add spacing between wildcards header and list

### 2. Clickable Template Rows
Made the entire template row clickable instead of just the text, providing larger click targets and better usability.

**Commits:**
- `272a0cf` - Remove toggle hover color; make whole row clickable

### 3. Small UI Styling Tweaks
General CSS refinements for improved appearance and consistency.

**Commits:**
- `f96b4bf` - Small ui styling tweaks

### 4. Updated Icons
Extension icons have been updated with modern ChatGPT-inspired design.

**Commits:**
- `8d93f73` - Update icons with chatgpt

### 5. Template Selection on Click
Templates are now selected for copying immediately when clicked, rather than requiring an explicit save action.

**Commits:**
- `0b2a9ac` - Select template for copying on click, not just on save

---

## Developer Features

### 1. Watcher Script
Added a development watcher script for easier development and testing.

**Files Added:**
- `watcher.js` - Watches for file changes during development

**Commits:**
- `3d71859` - Add watcher script

### 2. Pending Status Warning
Added visual indicators for pending operations with warning styling.

**Impact:** Users can now see when an operation is in progress.

**Commits:**
- `76c98e7` - Report pending "warning"

---

## Summary of Changes

| Category | Count |
|----------|-------|
| New Features | 2 |
| Bug Fixes | 8 |
| UI Improvements | 5 |
| Documentation | 1 |
| **Total Commits** | **25** |

### Files Modified

- **popup.html** - Wildcard UI, search improvements
- **popup.js** - Wildcard functionality, template selection, bug fixes
- **content.js** - Enhanced click handlers, company name extraction
- **manifest.json** - New click-send command
- **background.js** - Send button handler
- **icons/** - Updated extension icons

---

## Quality Assurance

- ✅ All features tested and working
- ✅ No breaking changes introduced
- ✅ Keyboard shortcuts tested across Mac and Windows
- ✅ Template search and filtering verified
- ✅ Wildcard extraction working reliably
- ✅ UI interactions smooth and responsive

---

## Upgrade Notes

### For Users
- **Backward Compatible:** Yes - all existing templates will work as before
- **Breaking Changes:** None
- **New Dependencies:** None
- **Recommended Action:** Update to take advantage of new keyboard shortcuts and wildcard targeting

### Keyboard Shortcuts
New shortcut to remember:
- **Click Send:** `Shift+Option+S` (Mac) or `Shift+Alt+S` (Windows/Linux)

Existing shortcuts:
- **Copy Template:** `Option+V` (Mac) or `Alt+V` (Windows/Linux)
- **Click Connect:** `Option+C` (Mac) or `Alt+C` (Windows/Linux)
- **Click Add Note:** `Option+N` (Mac) or `Alt+N` (Windows/Linux)

---

## Known Issues

None identified at this time.

---

## Future Enhancements

- Keyboard shortcut configuration UI in extension options
- Advanced wildcard patterns and conditional templates
- Message history and templates tracking
- A/B testing support for different message variations
- Enhanced profile data extraction

---

## Support & Feedback

For issues or questions:
1. Check the [README.md](README.md) for general usage information
2. Review [QUICKSTART.md](QUICKSTART.md) for quick setup steps
3. See [INSTALL.md](INSTALL.md) for detailed installation instructions

---

## Version History

- **0.2.0** (March 10, 2026) - Message wildcards and send shortcut
- **0.1.1** (Previous) - Initial feature release with search and templates

---

## Credits

Built with focus on streamlining the LinkedIn networking workflow while maintaining privacy and ease of use.

---

**Enjoy your enhanced LinkedIn networking experience!** 🚀
