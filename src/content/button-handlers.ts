import { scrapeLinkedInProfile } from './profile-scraper';
import { showNotification } from './notifications';

function getShadowRoot(): ShadowRoot | null {
  const outlet = document.querySelector('#interop-outlet');
  return outlet?.shadowRoot || null;
}

function findMoreButton(maxLevels = 10): HTMLButtonElement | null {
  const contactInfoSelector = 'a[href*=contact-info]';
  let container = document.querySelector(contactInfoSelector) as HTMLElement | null;
  let levels = 0;

  const getMoreButton = (): HTMLButtonElement | null => {
    return container?.querySelector('button[aria-label="More"]') as HTMLButtonElement | null;
  };

  let moreButton = getMoreButton();

  // Traverse up the DOM tree to find the common ancestor that contains the More button
  while (container && levels < maxLevels && !moreButton) {
    container = container.parentElement;
    moreButton = getMoreButton();
    levels++;
  }

  return moreButton;
}

export function clickConnect(): void {
  const { fullName } = scrapeLinkedInProfile();

  const ACTUALLY_CLICK = true;
  const onFindConnectButton = (button: HTMLButtonElement) => {
    if (ACTUALLY_CLICK) {
      button.click();
    } else {
      highlightAndLogButton(button, fullName);
    }
  };

  try {
    let connectButton = document.querySelector(
      `[aria-label="Invite ${fullName} to connect"]`
    ) as HTMLButtonElement | null;

    // If not found, click the More button and try again
    if (!connectButton) {
      const moreButton = findMoreButton();
      if (moreButton) {
        moreButton.click();
        // Wait for menu to render before searching again
        setTimeout(() => {
          connectButton = document.querySelector(
            `[aria-label="Invite ${fullName} to connect"]`
          ) as HTMLButtonElement | null;
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
    showNotification(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
  }
}

function highlightAndLogButton(button: HTMLButtonElement, label: string): void {
  // Store reference in window for devtools access
  (window as any).linkedInConnectButton = button;

  // Highlight with unmissable border and glow
  button.style.outline = '4px solid #ff0000';
  button.style.outlineOffset = '2px';
  button.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.8)';

  // Scroll to it
  button.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Log to console
  console.log(`[LS Extension] Found connect button for ${label}:`, button);
  console.log('Reference stored as: window.linkedInConnectButton');

  // Show notification
  showNotification(`Connect button found for ${label} - check console`, 'success');
}

export function clickAddNote(): void {
  try {
    const shadowRoot = getShadowRoot();
    if (!shadowRoot) {
      showNotification('Shadow root not found', 'error');
      return;
    }

    let addNoteButton = shadowRoot.querySelector(
      '[aria-label="Add a note"]'
    ) as HTMLButtonElement | null;

    if (addNoteButton) {
      addNoteButton.click();
      showNotification('Add note button clicked', 'success');
    } else {
      showNotification('Add note button not found on this page', 'error');
    }
  } catch (error) {
    console.error('Error clicking add note button:', error);
    showNotification(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
  }
}

export async function handleMessageSent(): Promise<void> {
  try {
    const res = await fetch('http://127.0.0.1:54321/functions/v1/handleMessageSent', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Functions' })
    });
    const data = await res.json();
    console.log('handleMessageSent response:', data);
    showNotification('handleMessageSent: success', 'success');
  } catch (error) {
    console.error('handleMessageSent error:', error);
    showNotification(`handleMessageSent error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
}

export function clickSend(): void {
  try {
    const shadowRoot = getShadowRoot();
    if (!shadowRoot) {
      showNotification('Shadow root not found', 'error');
      return;
    }

    let sendButton = shadowRoot.querySelector(
      '[aria-label="Send invitation"]'
    ) as HTMLButtonElement | null;

    if (sendButton) {
      sendButton.click();
      showNotification('Send button clicked', 'success');
    } else {
      showNotification('Send button not found on this page', 'error');
    }
  } catch (error) {
    console.error('Error clicking send button:', error);
    showNotification(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
  }
}
