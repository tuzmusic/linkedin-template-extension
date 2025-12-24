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
    const nameElement = document.querySelector('h1.text-heading-xlarge');
    if (nameElement) {
      data.fullName = nameElement.textContent.trim();
      const nameParts = data.fullName.split(' ');
      data.firstName = nameParts[0] || '';
      data.lastName = nameParts.slice(1).join(' ') || '';
    }

    // Get headline
    const headlineElement = document.querySelector('.text-body-medium.break-words');
    if (headlineElement) {
      data.headline = headlineElement.textContent.trim();
    }

    // Get current position and company from experience section
    // LinkedIn's structure: position is usually in the first experience item
    const experienceSection = document.querySelector('#experience');
    if (experienceSection) {
      const firstExperience = experienceSection.parentElement.querySelector('ul li');
      if (firstExperience) {
        const positionElement = firstExperience.querySelector('.t-bold span[aria-hidden="true"]');
        const companyElement = firstExperience.querySelector('.t-14.t-normal span[aria-hidden="true"]');

        if (positionElement) {
          data.position = positionElement.textContent.trim();
        }
        if (companyElement) {
          data.companyName = companyElement.textContent.trim();
        }
      }
    }

    // Alternative: try to get company from the top section
    if (!data.companyName) {
      const topCardElements = document.querySelectorAll('.text-body-small.inline');
      for (const elem of topCardElements) {
        const text = elem.textContent.trim();
        if (text && !text.includes('·') && text.length > 2) {
          data.companyName = text;
          break;
        }
      }
    }

    // Get location
    const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words');
    if (locationElement) {
      data.location = locationElement.textContent.trim();
    }

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
function showNotification(message, type = 'success') {
  // Remove existing notification if any
  const existing = document.getElementById('linkedin-template-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'linkedin-template-toast';
  toast.className = `linkedin-template-toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Animate out and remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
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
    if (charCount > 300) {
      showNotification(`Warning: Message is ${charCount}/300 chars (too long!)`, 'error');
      return;
    }

    // Copy to clipboard
    const success = await copyToClipboard(filledMessage);

    if (success) {
      showNotification(`Message copied! (${charCount}/300 chars)`, 'success');
    } else {
      showNotification('Failed to copy message', 'error');
    }
  } catch (error) {
    console.error('Error handling copy template:', error);
    showNotification('Error: ' + error.message, 'error');
  }
}
