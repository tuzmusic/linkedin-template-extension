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
    profileUrl: window.location.href
  };

  try {
    // Get full name from the h1 tag
    const nameElement = document.querySelector('h1.text-heading-xlarge') ||
                       document.querySelector('h1');
    if (nameElement) {
      data.fullName = nameElement.textContent.trim();
      const nameParts = data.fullName.split(' ');
      data.firstName = nameParts[0] || '';
      data.lastName = nameParts.slice(1).join(' ') || '';
    }

    // Get headline - try multiple selectors
    const headlineElement = document.querySelector('.text-body-medium.break-words') ||
                           document.querySelector('.pv-top-card--list-bullet span:first-child') ||
                           document.querySelector('[class*="headline"]');
    if (headlineElement) {
      data.headline = headlineElement.textContent.trim();
    }

    // Try to get position and company from the top card first (more reliable)
    const topCard = document.querySelector('.pv-top-card');
    if (topCard) {
      // Look for position/company in the profile top section
      const subtitleElement = topCard.querySelector('.text-body-medium');
      if (subtitleElement) {
        const subtitleText = subtitleElement.textContent.trim();
        // Format is usually "Position at Company" or just "Company"
        if (subtitleText.includes(' at ')) {
          const parts = subtitleText.split(' at ');
          data.position = parts[0].trim();
          data.companyName = parts[1].trim();
        } else if (subtitleText.includes(' · ')) {
          // Sometimes format is "Position · Company"
          const parts = subtitleText.split(' · ');
          data.position = parts[0].trim();
          if (parts[1]) data.companyName = parts[1].trim();
        } else {
          // Just company or position
          data.companyName = subtitleText;
        }
      }
    }

    // Fallback: Get current position and company from experience section
    if (!data.position || !data.companyName) {
      const experienceSection = document.querySelector('#experience');
      if (experienceSection) {
        const firstExperience = experienceSection.parentElement.querySelector('ul li');
        if (firstExperience) {
          const positionElement = firstExperience.querySelector('.t-bold span[aria-hidden="true"]') ||
                                 firstExperience.querySelector('[class*="profile-section-card__title"]');

          // For company, look for the first simple company name (not the one with duration info)
          let companyElement = null;
          const companySpans = firstExperience.querySelectorAll('.t-14.t-normal span[aria-hidden="true"]');
          for (const span of companySpans) {
            const text = span.textContent.trim();
            // Skip spans that contain duration markers like "·", "Full-time", "yrs", "mos"
            if (!text.includes('·') && !text.includes('Full-time') && !text.includes('Part-time') &&
                !text.includes(' yr') && !text.includes(' mo') && text.length > 0) {
              companyElement = span;
              break;
            }
          }

          if (positionElement && !data.position) {
            data.position = positionElement.textContent.trim();
          }
          if (companyElement && !data.companyName) {
            data.companyName = companyElement.textContent.trim();
          }
        }
      }
    }

    // Get location
    const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words') ||
                           document.querySelector('.pv-top-card--list-bullet li') ||
                           document.querySelector('[class*="location"]');
    if (locationElement) {
      data.location = locationElement.textContent.trim();
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
    '{{location}}': data.location
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
function showNotification(message, type = 'success', copiedMessage = null) {
  // Remove existing notification if any
  const existing = document.getElementById('linkedin-template-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'linkedin-template-toast';
  toast.className = `linkedin-template-toast ${type}`;

  if (copiedMessage) {
    // Show header, message preview, and footer
    toast.innerHTML = `
      <div class="linkedin-template-toast-header">${message}</div>
      <div class="linkedin-template-toast-message">${copiedMessage}</div>
      <div class="linkedin-template-toast-footer">Press Cmd+V to paste</div>
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

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyTemplate') {
    handleCopyTemplate();
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
      const warningText = charCount > 300 ? '\n⚠️ Message exceeds 300 character limit' : '';
      showNotification(`Message copied! (${charCount}/300 chars)${warningText}`, 'success', filledMessage);
    } else {
      showNotification('Failed to copy message', 'error');
    }
  } catch (error) {
    console.error('Error handling copy template:', error);
    showNotification('Error: ' + error.message, 'error');
  }
}
