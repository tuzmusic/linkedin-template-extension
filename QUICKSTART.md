# Quick Start Guide

## Installation (2 minutes)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked" → Select the `linkedin-template-extension` folder
4. Done! Look for the blue "LT" icon in your toolbar

## Usage (30 seconds)

1. **Set your template** (one time):
   - Click the LT icon
   - Type: `Hi {{firstName}}, I noticed you work at {{companyName}}. Let's connect!`
   - Click "Save Template"

2. **Use it** (on any LinkedIn profile):
   - Navigate to someone's LinkedIn profile
   - Press `Cmd+Shift+L` (Mac) or `Ctrl+Shift+L` (Windows)
   - See green notification: "Message copied!"
   - Go to LinkedIn → Connect → Add a note → Paste (`Cmd+V`)
   - Send!

## That's it!

The extension will automatically:
- Replace `{{firstName}}` with their first name
- Replace `{{companyName}}` with their company
- Check the 300-character limit
- Show you how long the message is

## Available Wildcards

Copy and paste these into your template:

```
{{firstName}}      - John
{{lastName}}       - Doe
{{fullName}}       - John Doe
{{companyName}}    - Google
{{position}}       - Software Engineer
{{headline}}       - Building amazing products
{{location}}       - San Francisco Bay Area
```

## Example Templates

**Professional:**
```
Hi {{firstName}}, I came across your profile and was impressed by your work at {{companyName}}. I'd love to connect and exchange ideas about {{position}}.
```

**Casual:**
```
Hey {{firstName}}! Fellow {{position}} here. Would love to connect and learn from your experience at {{companyName}}!
```

**Short:**
```
Hi {{firstName}}, let's connect! I'm interested in {{companyName}}'s work.
```

## Pro Tips

- Keep it under 300 characters (extension will warn you)
- Test on 2-3 profiles to make sure wildcards work
- Be genuine - personalization helps but authenticity matters more
- Change your template anytime by clicking the extension icon

---

**Questions?** See [README.md](README.md) for full documentation.
