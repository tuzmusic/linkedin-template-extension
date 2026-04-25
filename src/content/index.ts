import { scrapeLinkedInProfile } from './profile-scraper';
import { fillTemplate } from './template-filler';
import { showNotification } from './notifications';
import { clickAddNote, clickConnect, clickSend, handleMessageSent } from './button-handlers';
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
    const result = await chrome.storage.sync.get<AppStorageState>(['messageTemplate']);
    const template = result.messageTemplate || "Hi {{firstName}}, I'd love to connect!";

    // Scrape profile data
    const profileData = scrapeLinkedInProfile();

    // Fill template
    const filledMessage = fillTemplate(template, profileData);

    // Check character count
    const charCount = filledMessage.length;

    // Copy to clipboard (even if too long)
    const success = await copyToClipboard(filledMessage);

    if (success) {
      // Show green toast with warning if too long
      const warningText =
        charCount > 300 ? '⚠️ Message exceeds 300 character limit' : null;
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
    clickAddNote();
  } else if (request.action === 'clickSend') {
    clickSend();
  } else if (request.action === 'testMessageSent') {
    handleMessageSent();
  } else if (request.action === 'showNotification') {
    showNotification(request.message, request.type || 'info');
  }
});
