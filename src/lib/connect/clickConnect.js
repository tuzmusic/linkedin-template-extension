import { scrapeLinkedInProfile } from '../scrapeLinkedInProfile.js';
import { showNotification } from '../utils/showNotification.js';
import { findMoreButton } from './findMoreButton.js';
import { highlightAndLogButton } from './highlightAndLogButton.js';

export async function clickConnect() {
  const { fullName } = scrapeLinkedInProfile();

  // if fixing a broken connect button query, set to false so we don't find a button that
  // connects without asking for a note.
  const ACTUALLY_CLICK = true;
  const onFindConnectButton = button => {
    if (ACTUALLY_CLICK) button.click();
    else highlightAndLogButton(button, fullName);
  };

  try {
    let connectButton = document.querySelector(`[aria-label="Invite ${fullName} to connect"]`);

    // If not found, click the More button and try again
    if (!connectButton) {
      const moreButton = findMoreButton();
      if (moreButton) {
        moreButton.click();
        // Wait for menu to render before searching again
        setTimeout(() => {
          connectButton = document.querySelector(`[aria-label="Invite ${fullName} to connect"]`);
          if (connectButton) {
            onFindConnectButton(connectButton);
          } else {
            showNotification('Connect button not found in More menu', 'error');
          }
        }, 150);
        return;
      } else {
        showNotification('Could not find connect button, or More menu', 'error');
        return;
      }
    }

    const pendingButton = document.querySelector('[aria-label*="Pending"]');

    if (connectButton) {
      onFindConnectButton(connectButton);
    } else if (pendingButton) {
      showNotification('You already have a pending invitation for this user', 'error');
    } else {
      showNotification('Connect button not found on this page', 'error');
    }
  } catch (error) {
    console.error('Error clicking connect button:', error);
    showNotification('Error: ' + error.message, 'error');
  }
}
