import { scrapeLinkedInProfile } from '../scrapeLinkedInProfile.js';
import { fillTemplate } from '../fillTemplate.js';
import { copyToClipboard } from '../utils/copyToClipboard.js';
import { showNotification } from '../utils/showNotification.js';

export async function handleCopyTemplate() {
  try {
    // Get the template from storage
    const result = await chrome.storage.sync.get(['messageTemplate']);
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
      const warningText = charCount > 300 ? '⚠️ Message exceeds 300 character limit' : null;
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
    showNotification('Error: ' + error.message, 'error');
  }
}
