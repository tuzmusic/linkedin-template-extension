import { scrapeLinkedInProfile } from './profile-scraper';
import { fillTemplate } from './template-filler';
import { showNotification } from './notifications';
import { AppStorageState } from '../utils/storage';

function getShadowRoot(): ShadowRoot | null {
  const outlet = document.querySelector('#interop-outlet');
  return outlet?.shadowRoot || null;
}

// Items that only show up in a profile's "More" menu. Which ones appear varies (Connect,
// Follow, etc. move between the menu and the top card), so any one of these is enough.
const PROFILE_MENU_ITEMS = new Set([
  'Send profile in a message',
  'Save to PDF',
  'About this profile',
  'Report / Block',
  'Request a recommendation',
  'Remove connection',
]);

const MENU_WAIT_MS = 800;

function findConnectButton(displayName: string): HTMLButtonElement | null {
  return document.querySelector(
    `[aria-label="Invite ${displayName} to connect"]`
  ) as HTMLButtonElement | null;
}

function hasVisibleText(root: Node, texts: Set<string>): boolean {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue?.trim();
    if (text && texts.has(text) && node.parentElement?.checkVisibility()) return true;
  }
  return false;
}

function isProfileMenuOpen(): boolean {
  const shadowRoot = getShadowRoot();
  return hasVisibleText(document, PROFILE_MENU_ITEMS)
    || (!!shadowRoot && hasVisibleText(shadowRoot, PROFILE_MENU_ITEMS));
}

function getMoreButtonCandidates(): HTMLButtonElement[] {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('button[aria-label="More"], button[aria-label="More actions"]')
  ).filter((button) => button.checkVisibility());
  // Profile actions live in <main>, global nav menus don't, so try those first
  const inMain = (button: HTMLButtonElement) => !!button.closest('main');
  return [...buttons.filter(inMain), ...buttons.filter((button) => !inMain(button))];
}

function waitFor<T>(check: () => T | null, timeoutMs: number): Promise<T | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const poll = () => {
      const result = check();
      if (result !== null || Date.now() - start > timeoutMs) {
        resolve(result);
      } else {
        setTimeout(poll, 50);
      }
    };
    poll();
  });
}

// Opens each "More" menu until one turns out to be the profile's, closing the wrong ones
async function findConnectInMoreMenus(
  displayName: string
): Promise<{ connectButton: HTMLButtonElement | null; foundProfileMenu: boolean }> {
  for (const moreButton of getMoreButtonCandidates()) {
    moreButton.click();
    const found = await waitFor<HTMLButtonElement | 'profileMenu'>(
      () => findConnectButton(displayName) ?? (isProfileMenuOpen() ? 'profileMenu' : null),
      MENU_WAIT_MS
    );
    if (found === 'profileMenu') return { connectButton: null, foundProfileMenu: true };
    if (found) return { connectButton: found, foundProfileMenu: true };
    // Not the profile menu: close it before trying the next one
    moreButton.click();
  }
  return { connectButton: null, foundProfileMenu: false };
}

export async function clickConnect(): Promise<void> {
  // Use the name as displayed (with any emoji) so it matches LinkedIn's aria-label
  const { displayName } = scrapeLinkedInProfile();

  const ACTUALLY_CLICK = true;
  const onFindConnectButton = (button: HTMLButtonElement) => {
    if (ACTUALLY_CLICK) {
      button.click();
    } else {
      highlightAndLogButton(button, displayName);
    }
  };

  try {
    const connectButton = findConnectButton(displayName);

    // If not found, look for it in the profile's More menu
    if (!connectButton) {
      const { connectButton: menuConnectButton, foundProfileMenu } =
        await findConnectInMoreMenus(displayName);
      if (menuConnectButton) {
        onFindConnectButton(menuConnectButton);
      } else if (foundProfileMenu) {
        showNotification('Connect button not found in More menu', 'error');
      } else {
        showNotification('Could not find connect button, or More menu', 'error');
      }
      return;
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

  const result = await chrome.storage.sync.get<AppStorageState>(['currentWork']);
  const template = result.currentWork?.template;
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
