import { defineManifest } from "@crxjs/vite-plugin";
import pkg from './package.json'

export default defineManifest({
  "manifest_version": 3,
  "name": "LinkedIn Secret Weapon",
  "version": pkg.version,
  "description": "Tools for responsibly supercharging your networking workflow 🚀",
  "permissions": [
    "storage",
    "activeTab",
    "clipboardWrite"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*",
    "http://127.0.0.1:54321/*"
  ],
  "background": {
    "service_worker": "src/background/service-worker.ts"
  },
  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/*"],
      "js": ["src/content/index.ts"]
    }
  ],
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "options_page": "src/options/options.html",
  "commands": {
    "copy-template": {
      "suggested_key": {
        "default": "Alt+V",
        "mac": "Option+V"
      },
      "description": "Copy personalized template to clipboard"
    },
    "click-connect": {
      "suggested_key": {
        "default": "Alt+C",
        "mac": "Option+C"
      },
      "description": "Click the Connect button"
    },
    "click-add-note": {
      "suggested_key": {
        "default": "Alt+N",
        "mac": "Option+N"
      },
      "description": "Click the Add note button"
    },
    "click-send": {
      "suggested_key": {
        "default": "Shift+Alt+S",
        "mac": "Shift+Option+S"
      },
      "description": "Click the Send invitation button"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
})
