import { showNotification } from '../utils/showNotification.js';

export function highlightAndLogButton(button, label) {
  // Store reference in window for devtools access
  window.linkedInConnectButton = button;

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
