// Content script for LinkedIn profile pages

// LinkedIn profile data scraper
function scrapeLinkedInProfile() {
  const data = {
    firstName: '',
    lastName: '',
    fullName: '',
    headline: '',
    companyName: '',
    position: '',
    location: '',
    profileUrl: window.location.href,
    msgFirstName: null,
    msgLastName: null,
    msgFullName: null
  };

  try {
    // Get full name from page title (e.g., "Name | LinkedIn")
    let fullName = '';
    const pageTitle = document.title;
    if (pageTitle && pageTitle.includes('|')) {
      fullName = pageTitle.split('|')[0].trim();
    }

    if (fullName) {
      data.fullName = fullName
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
      const nameParts = data.fullName.split(' ').filter(part => part.length > 0);
      data.firstName = nameParts[0] || '';
      data.lastName = nameParts.slice(1).join(' ') || '';
    }

    // Get headline - try multiple selectors
    const headlineElement = document.querySelector('[data-test-id="top-card-headline"]') ||
      document.querySelector('.text-body-medium') ||
      document.querySelector('[class*="headline"]');
    if (headlineElement) {
      data.headline = headlineElement.textContent.trim();
    }

    // Get company name - try from button or experience
    let companyButton = document.querySelector('button[aria-label*="Current company"], button[aria-label*="company"]');
    if (companyButton) {
      const ariaLabel = companyButton.getAttribute('aria-label');
      const match = ariaLabel.match(/company[:\s]+([^.]+)/i);
      if (match) {
        data.companyName = match[1].trim();
      }
    }

    // Fallback: Get from experience section
    if (!data.companyName || !data.position) {
      const experienceSection = document.querySelector('[id*="experience"], [data-test-id*="experience"]');
      if (experienceSection) {
        // Find the first experience item
        const firstItem = experienceSection.querySelector('li, .base-card, [role="listitem"]');
        if (firstItem) {
          // Look for position/title
          const posElement = firstItem.querySelector('h3, .base-card__title, [class*="title"]');
          if (posElement && !data.position) {
            const posText = posElement.textContent.trim();
            if (posText && posText.length < 100) {
              data.position = posText;
            }
          }

          // Look for company
          const compElement = firstItem.querySelector('.base-card__subtitle, [class*="company"], h4');
          if (compElement && !data.companyName) {
            const compText = compElement.textContent.trim();
            if (compText && compText.length < 100) {
              data.companyName = compText;
            }
          }
        }
      }
    }

    // Get location
    const locationElement = document.querySelector('[data-test-id="top-card-location"]') ||
      document.querySelector('[class*="location"]');
    if (locationElement) {
      data.location = locationElement.textContent.trim();
    }

    // Get message recipient name from open message conversation
    const msgProfileCard = document.querySelector('.msg-s-profile-card-one-to-one');
    if (msgProfileCard) {
      const nameElement = msgProfileCard.querySelector('.profile-card-one-to-one__profile-link span.truncate');
      if (nameElement) {
        const fullName = nameElement.textContent.trim();
        data.msgFullName = fullName;
        const nameParts = fullName.split(' ').filter(part => part.length > 0);
        data.msgFirstName = nameParts[0] || null;
        data.msgLastName = nameParts.slice(1).join(' ') || null;
      }
    }

    // Debug log
    console.log('Scraped LinkedIn data:', data);

  } catch (error) {
    console.error('Error scraping LinkedIn profile:', error);
  }

  return data;
}

// Fill template with scraped data
function fillTemplate(template, data) {
  let filled = template;

  // Replace all wildcards
  const wildcards = {
    '{{firstName}}': data.firstName,
    '{{lastName}}': data.lastName,
    '{{fullName}}': data.fullName,
    '{{companyName}}': data.companyName,
    '{{company}}': data.companyName, // alias
    '{{position}}': data.position,
    '{{headline}}': data.headline,
    '{{location}}': data.location,
    '{{msgFirstName}}': data.msgFirstName === null ? 'NULL' : data.msgFirstName,
    '{{msgLastName}}': data.msgLastName === null ? 'NULL' : data.msgLastName,
    '{{msgFullName}}': data.msgFullName === null ? 'NULL' : data.msgFullName
  };

  for (const [wildcard, value] of Object.entries(wildcards)) {
    filled = filled.replace(new RegExp(wildcard, 'g'), value || '');
  }

  return filled;
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Show toast notification
function showNotification(message, type = 'success', copiedMessage = null, warning = null) {
  // Remove existing notification if any
  const existing = document.getElementById('linkedin-template-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'linkedin-template-toast';
  toast.className = `linkedin-template-toast ${type}`;

  if (copiedMessage) {
    // Show header, message preview, footer, and optional warning
    const warningHtml = warning ? `<div class="linkedin-template-toast-warning">${warning}</div>` : '';
    toast.innerHTML = `
      <div class="linkedin-template-toast-header">${message}</div>
      <div class="linkedin-template-toast-message">${copiedMessage}</div>
      <div class="linkedin-template-toast-footer">Press Cmd+V to paste</div>
      ${warningHtml}
    `;
  } else {
    // Simple message
    toast.textContent = message;
  }

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Function to hide toast
  const hideToast = () => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
      // Remove paste listener when toast is removed
      document.removeEventListener('paste', pasteListener);
    }, 300);
  };

  // Listen for paste event (Cmd+V)
  const pasteListener = (e) => {
    hideToast();
  };
  document.addEventListener('paste', pasteListener);

  // Auto-hide after 5 seconds
  setTimeout(hideToast, 5000);
}

// Find the More button menu
function findMoreButton(maxLevels = 10) {
  const contactInfoSelector = 'a[href*=contact-info]'
  let container = document.querySelector(contactInfoSelector);
  let levels = 0;

  const getMoreButton = () => container.querySelector('button[aria-label="More"]')
  let moreButton = getMoreButton()

  // Traverse up the DOM tree to find the common ancestor that contains the More button
  while (container && levels < maxLevels && !moreButton) {
    container = container.parentElement;
    moreButton = getMoreButton()
    levels++;
  }

  return moreButton;
}

// Click the Connect button
function clickConnect() {
  try {
    const {fullName} = scrapeLinkedInProfile();

    // Try to find connect button with current selectors
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
            highlightAndLogButton(connectButton, fullName);
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
      // highlightAndLogButton(connectButton, fullName);
      connectButton.click()
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

// Highlight button, scroll to it, and store in devtools
function highlightAndLogButton(button, label) {
  // Store reference in window for devtools access
  window.linkedInConnectButton = button;

  // Highlight with unmissable border and glow
  button.style.outline = '4px solid #ff0000';
  button.style.outlineOffset = '2px';
  button.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.8)';

  // Scroll to it
  button.scrollIntoView({behavior: 'smooth', block: 'center'});

  // Log to console
  console.log(`[LS Extension] Found connect button for ${label}:`, button);
  console.log('Reference stored as: window.linkedInConnectButton');

  // Show notification
  showNotification(`Connect button found for ${label} - check console`, 'success');
}

// Click the Add note button
function clickAddNote() {
  try {
    let addNoteButton = document.querySelector('[aria-label="Add a note"]') ||
      Array.from(document.querySelectorAll('button')).find(btn =>
        btn.getAttribute('aria-label')?.includes('note')
      );

    if (addNoteButton) {
      addNoteButton.click();
      showNotification('Add note button clicked', 'success');
    } else {
      showNotification('Add note button not found on this page', 'error');
    }
  } catch (error) {
    console.error('Error clicking add note button:', error);
    showNotification('Error: ' + error.message, 'error');
  }
}

// Click the Send invitation button
function clickSend() {
  try {
    let sendButton = document.querySelector('[aria-label="Send invitation"]') ||
      Array.from(document.querySelectorAll('button')).find(btn =>
        btn.getAttribute('aria-label')?.includes('Send')
      );

    if (sendButton) {
      sendButton.click();
      showNotification('Send button clicked', 'success');
    } else {
      showNotification('Send button not found on this page', 'error');
    }
  } catch (error) {
    console.error('Error clicking send button:', error);
    showNotification('Error: ' + error.message, 'error');
  }
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyTemplate') {
    handleCopyTemplate();
  } else if (request.action === 'clickConnect') {
    clickConnect();
  } else if (request.action === 'clickAddNote') {
    clickAddNote();
  } else if (request.action === 'clickSend') {
    clickSend();
  } else if (request.action === 'showNotification') {
    showNotification(request.message, request.type || 'info');
  }
});

// Main function to handle template copying
async function handleCopyTemplate() {
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
      showNotification(`Message copied! (${charCount}/300 chars)`, 'success', filledMessage, warningText);
    } else {
      showNotification('Failed to copy message', 'error');
    }
  } catch (error) {
    console.error('Error handling copy template:', error);
    showNotification('Error: ' + error.message, 'error');
  }
}
