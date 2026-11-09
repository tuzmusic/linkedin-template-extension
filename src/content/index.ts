import { scrapeLinkedInProfile } from './profile-scraper';
import { fillTemplate } from './template-filler';
import { showNotification } from './notifications';
import { clickAddNote, clickConnect, clickSend, handleAddNote } from './button-handlers';
import './styles.css';
import { AppStorageState } from "../utils/storage.ts";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

async function handleCopyTemplate(): Promise<void> {
  try {
    // Get the template from storage
    const result = await chrome.storage.sync.get<AppStorageState>(['currentWork']);
    const template = result.currentWork?.template || "Hi {{firstName}}, I'd love to connect!";

    // Scrape profile data; off a profile (or message thread) there's nothing to fill from,
    // so copy the template as-is and warn instead of failing
    const profileData = scrapeLinkedInProfile();
    const hasProfile =
      (window.location.pathname.startsWith('/in/') && !!profileData.firstName) ||
      !!profileData.msgFullName;
    const filledMessage = hasProfile ? fillTemplate(template, profileData) : template;

    // Check character count
    const charCount = filledMessage.length;

    // Copy to clipboard (even if too long)
    const success = await copyToClipboard(filledMessage);

    if (success) {
      // Show green toast with warning if too long
      const warningText = !hasProfile
        ? '⚠️ No LinkedIn profile found; copied template unfilled'
        : charCount > 300
          ? '⚠️ Message exceeds 300 character limit'
          : null;
      showNotification(
        `Message copied! (${charCount}/300 chars)`,
        'success',
        filledMessage,
        warningText
      );
    } else {
      showNotification('Failed to copy message', 'error');
    }
  } catch (error) {
    console.error('Error handling copy template:', error);
    showNotification(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
  }
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === 'copyTemplate') {
    handleCopyTemplate();
  } else if (request.action === 'clickConnect') {
    clickConnect();
  } else if (request.action === 'clickAddNote') {
    handleAddNote();
  } else if (request.action === 'clickSend') {
    clickSend();
  } else if (request.action === 'showNotification') {
    showNotification(request.message, request.type || 'info');
  }
});
