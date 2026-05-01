import { scrapeLinkedInProfile } from './profile-scraper';
import { fillTemplate } from './template-filler';
import { showNotification } from './notifications';
import { AppStorageState } from '../utils/storage';

function getShadowRoot(): ShadowRoot | null {
  const outlet = document.querySelector('#interop-outlet');
  return outlet?.shadowRoot || null;
}

function findMoreButton(maxLevels = 10): HTMLButtonElement | null {
  // this **assumes** the "more" button we're looking for is the second "more" button on the page
  const secondMoreButton = document.querySelectorAll('button[aria-label="More"]')[1] as HTMLButtonElement | null;
  if (secondMoreButton) return secondMoreButton;

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

export function waitForTextarea(timeoutMs = 3000): Promise<HTMLTextAreaElement> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const textarea = getShadowRoot()?.querySelector(
        'textarea#custom-message'
      ) as HTMLTextAreaElement | null;
      if (textarea) {
        clearInterval(interval);
        resolve(textarea);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error("'Add note' window not found"));
      }
    }, 50);
  });
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

async function fillTemplateIntoTextarea(): Promise<void> {
  const textarea = await waitForTextarea();

  const result = await chrome.storage.sync.get<AppStorageState>(['messageTemplate']);
  const template = result.messageTemplate;
  if (!template) {
    showNotification('Tried to paste the template, but no template has been set', 'error');
    return;
  }

  const profileData = scrapeLinkedInProfile();
  const filledMessage = fillTemplate(template, profileData);

  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  )?.set;
  if (nativeSetter) {
    nativeSetter.call(textarea, filledMessage);
  } else {
    textarea.value = filledMessage;
  }
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

export async function handleAddNote(): Promise<void> {
  try {
    const modalAlreadyOpen = !!document.querySelector('#interop-outlet')?.shadowRoot?.querySelector('textarea#custom-message');
    if (!modalAlreadyOpen) {
      clickAddNote();
    }
    await fillTemplateIntoTextarea();
  } catch (error) {
    showNotification(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
}
