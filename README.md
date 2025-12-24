# LinkedIn Message Template Extension

A Chrome extension that helps you quickly copy personalized LinkedIn connection request messages using customizable templates with wildcards.

## Features

- **Message Templates**: Create reusable message templates with wildcard support
- **Keyboard Shortcut**: Press `Cmd+.` (Mac) or `Ctrl+.` (Windows/Linux) to copy personalized messages
- **Auto-Fill Wildcards**: Automatically extracts profile data and fills in template placeholders
- **Character Counter**: Shows character count (LinkedIn's 300 char limit) with warnings
- **Toast Notifications**: Visual feedback when message is copied
- **Easy Management**: Simple popup and settings page to manage your templates

## Supported Wildcards

- `{{firstName}}` - Contact's first name
- `{{lastName}}` - Contact's last name
- `{{fullName}}` - Contact's full name
- `{{companyName}}` or `{{company}}` - Current company name
- `{{position}}` - Current job position
- `{{headline}}` - LinkedIn headline
- `{{location}}` - Location

## Installation

### From Source (Developer Mode)

1. **Download/Clone this repository**
   ```bash
   git clone <repository-url>
   cd linkedin-template-extension
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `linkedin-template-extension` folder
   - The extension should now appear in your extensions list

5. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Find "LinkedIn Message Template"
   - Click the pin icon to keep it visible

## Usage

### Setting Up Your Template

**Option 1: Using the Popup**
1. Click the extension icon in Chrome toolbar
2. Enter your message template
3. Use wildcards like `{{firstName}}` and `{{companyName}}`
4. Click "Save Template"

**Option 2: Using the Settings Page**
1. Right-click the extension icon → Options
2. Enter your message template
3. Click "Save Template"

**Example Template:**
```
Hi {{firstName}}, I noticed you work at {{companyName}}. I'd love to connect and learn more about your work in {{position}}!
```

### Sending Connection Requests

1. **Navigate to a LinkedIn Profile**
   - Go to any LinkedIn profile page (e.g., `linkedin.com/in/someone`)

2. **Copy Personalized Message**
   - Press `Cmd+.` (Mac) or `Ctrl+.` (Windows/Linux)
   - You'll see a toast notification: "Message copied! (XXX/300 chars)"

3. **Paste into LinkedIn**
   - Click the "Connect" button on LinkedIn
   - Click "Add a note"
   - Paste (`Cmd+V` or `Ctrl+V`) your personalized message
   - Send the request!

### Tips

- **Character Limit**: LinkedIn limits connection messages to 300 characters. The extension will warn you if your message is too long.
- **Missing Data**: If a wildcard can't be filled (e.g., company not found), it will be replaced with an empty string.
- **Test Your Template**: Try it on a few profiles to make sure the wildcards are working as expected.
- **Multiple Templates**: Currently supports one template. You can manually change it in settings as needed.

## Troubleshooting

### Extension not working on LinkedIn
- Make sure you're on a profile page (URL contains `/in/`)
- Try refreshing the page
- Check if the extension is enabled in `chrome://extensions/`

### Keyboard shortcut not working
- Check if another extension is using the same shortcut
- Go to `chrome://extensions/shortcuts` to view/modify shortcuts
- Make sure you're on a LinkedIn page, not the Chrome extensions page

### Wildcards not filling correctly
- LinkedIn's page structure may change over time
- Some profiles may have incomplete information
- Try different profiles to see if the issue is consistent

### Icons not showing
- The basic placeholder icons should work fine
- You can create custom icons by replacing files in the `icons/` folder

## Development

### Project Structure
```
linkedin-template-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for keyboard shortcuts
├── content.js             # Content script for LinkedIn pages
├── content.css            # Styles for toast notifications
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
├── options.html           # Settings page UI
├── options.js             # Settings page logic
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Key Files

- **manifest.json**: Extension configuration, permissions, and keyboard commands
- **content.js**: Scrapes LinkedIn profile data and handles template filling
- **background.js**: Listens for keyboard shortcuts and coordinates actions
- **popup.html/js**: Quick template editor in extension popup
- **options.html/js**: Full settings page with detailed documentation

## Privacy

This extension:
- ✅ Only runs on LinkedIn.com
- ✅ Stores templates locally in your browser (Chrome Sync Storage)
- ✅ Does NOT send any data to external servers
- ✅ Does NOT track your activity
- ✅ Only accesses the current active tab when you press the keyboard shortcut

## License

MIT License - Feel free to modify and distribute

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## Disclaimer

This extension is not affiliated with LinkedIn. Use responsibly and in accordance with LinkedIn's Terms of Service. The extension does not automate sending connection requests - it only helps you create personalized messages faster.
