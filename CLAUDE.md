# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LinkedIn Secret Weapon** is a Chrome extension that helps users quickly copy personalized LinkedIn connection request
messages using customizable templates with wildcard substitution. It scrapes profile data from LinkedIn pages and
auto-fills template placeholders.

## Commands

### Development

- `npm run dev` — Start Vite dev server (hot reload for popup/options pages)
- `npm run build` — Production build: compiles TypeScript, bundles with Vite, generates `dist/` folder and
  `release/release-*.zip`

### Testing the Extension Locally

1. Build: `npm run build`
2. Load unpacked in Chrome:
    - Navigate to `chrome://extensions/`
    - Enable Developer Mode (top right)
    - Click "Load unpacked" → select `dist/` folder
3. Test on a LinkedIn profile page: press `Option+V` (Mac) or `Alt+V` (Windows/Linux)
4. Check for errors:
    - Service Worker console: `chrome://extensions` → click "Service Worker" link on the extension
    - Content script console: right-click page → Inspect → Console tab
    - Popup console: right-click extension icon → Inspect → Console tab

## Architecture

The extension uses a **service worker + content script + popup UI** pattern:

- **Service Worker** (`src/background/service-worker.ts`): Listens for keyboard commands (`chrome.commands.onCommand`)
  and sends messages to the content script
- **Content Script** (`src/content/index.ts`): Runs on LinkedIn pages, scrapes profile data, fills templates, handles
  button clicks, and displays notifications
- **Popup UI** (`src/popup/`): Preact components for the quick template editor
- **Options Page** (`src/options/`): Settings UI for managing multiple templates

### Data Flow for Keyboard Shortcuts

1. User presses `Option+V` on a LinkedIn profile
2. Service worker's `chrome.commands.onCommand` listener fires
3. Service worker sends `chrome.tabs.sendMessage()` to content script with action (e.g., `copyTemplate`)
4. Content script receives the message, scrapes profile data, fills template, copies to clipboard, shows toast
   notification

### Manifest & Build Configuration

- **manifest.config.ts**: Extension configuration (uses `@crxjs/vite-plugin` to process into `dist/manifest.json`)
- **vite.config.ts**: Vite config with Preact preset, CRXJS plugin, and zip plugin
- **Critical detail**: The background script is named `service-worker.ts` (not `index.ts`) to avoid Vite confusing it
  with the content script's `index.ts`. Both bundles are created; the loader must reference the correct background
  bundle.

## Key Files

| File                               | Purpose                                                                      |
|------------------------------------|------------------------------------------------------------------------------|
| `src/background/service-worker.ts` | Service worker; listens for keyboard commands                                |
| `src/content/index.ts`             | Content script; message listener and clipboard logic                         |
| `src/content/profile-scraper.ts`   | Extracts profile data (firstName, company, position, etc.) from LinkedIn DOM |
| `src/content/template-filler.ts`   | Replaces `{{wildcard}}` placeholders with scraped data                       |
| `src/content/button-handlers.ts`   | Clicks LinkedIn buttons (Connect, Add Note, Send)                            |
| `src/content/notifications.ts`     | Toast notifications                                                          |
| `src/popup/Popup.tsx`              | Main popup component (template editor)                                       |
| `src/options/Options.tsx`          | Settings page component (manage multiple templates)                          |
| `src/types.ts`                     | Shared TypeScript interfaces                                                 |
| `src/utils/storage.ts`             | Wrapper for Chrome storage API                                               |

## Common Tasks

### Adding a New Keyboard Shortcut

1. Add command to `manifest.config.ts` under `commands`
2. Add listener case in `src/background/service-worker.ts`
3. Add message handler in `src/content/index.ts`
4. Implement the action function

### Adding a New Wildcard

1. Extract data in `src/content/profile-scraper.ts`
2. Add replacement logic to `src/content/template-filler.ts`
3. Document in README.md

### Debugging

- **"Service worker (inactive)"**: Service worker crashed. Check Service Worker console for errors.
- **Keyboard shortcuts not firing**: Verify content script is injected (right-click page → Inspect → Console) and check
  service worker console for message errors.
- **Template not filling**: Check `src/content/profile-scraper.ts` — LinkedIn's DOM structure changes may require
  updated selectors.

## Release Process

1. Update version in `package.json`
2. Run `npm run build`
3. Test locally with fresh `dist/` folder
4. Upload the generated `release/release-*.zip`
   to [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)

## Tech Stack

- **Preact** — lightweight React alternative
- **TypeScript** — type safety
- **Vite** — build tool
- **Tailwind CSS** — styling
- **@crxjs/vite-plugin** — Chrome extension bundling
- **vite-plugin-zip-pack** — auto-generates release zip
