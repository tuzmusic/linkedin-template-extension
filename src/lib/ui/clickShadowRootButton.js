import { showNotification } from '../utils/showNotification.js';

const getShadowRoot = () => document.querySelector('#interop-outlet').shadowRoot;

export async function clickShadowRootButton(ariaLabel) {
  try {
    const button = getShadowRoot().querySelector(`[aria-label="${ariaLabel}"]`);

    if (button) {
      button.click();
      showNotification(`${ariaLabel} clicked`, 'success');
      return true;
    } else {
      showNotification(`${ariaLabel} not found on this page`, 'error');
      return false;
    }
  } catch (error) {
    console.error(`Error clicking ${ariaLabel}:`, error);
    showNotification('Error: ' + error.message, 'error');
    return false;
  }
}
