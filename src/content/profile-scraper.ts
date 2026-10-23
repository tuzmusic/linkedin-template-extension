export interface LinkedInProfileData {
  firstName: string;
  lastName: string;
  fullName: string;
  // Name exactly as LinkedIn displays it (may include emoji); use for matching DOM elements, not for templates
  displayName: string;
  headline: string;
  companyName: string | null;
  position: string;
  location: string;
  profileUrl: string;
  msgFirstName: string | null;
  msgLastName: string | null;
  msgFullName: string | null;
}

// Strip emoji and zero-width chars so names read naturally in templates (e.g. "💻 Wendy G." -> "Wendy G.")
function cleanName(name: string): string {
  return name
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[\u200B-\u200D\uFE0F\uFEFF]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function scrapeLinkedInProfile(): LinkedInProfileData {
  const data: LinkedInProfileData = {
    firstName: '',
    lastName: '',
    fullName: '',
    displayName: '',
    headline: '',
    companyName: null,
    position: '',
    location: '',
    profileUrl: window.location.href,
    msgFirstName: null,
    msgLastName: null,
    msgFullName: null
  };

  try {
    // Get full name from page title (e.g., "Name | LinkedIn", or "(2) Name | LinkedIn" when there are notifications)
    let fullName = '';
    const pageTitle = document.title;
    if (pageTitle && pageTitle.includes('|')) {
      fullName = pageTitle.split('|')[0].replace(/^\s*\(\d+\+?\)\s*/, '').trim();
    }

    if (fullName) {
      data.displayName = fullName;
      data.fullName = cleanName(fullName);
      const nameParts = data.fullName.split(' ').filter(part => part.length > 0);
      data.firstName = nameParts[0] || '';
      data.lastName = nameParts.slice(1).join(' ') || '';
    }

    // Get headline - try multiple selectors
    const headlineElement = document.querySelector('[data-test-id="top-card-headline"]') ||
      document.querySelector('.text-body-medium') ||
      document.querySelector('[class*="headline"]');
    if (headlineElement) {
      data.headline = headlineElement.textContent?.trim() || '';
    }

    // This should be the company logo in the header
    const companyLogos = document.querySelectorAll('[src*="company-logo"]')
    const companyLogo = Array.from(companyLogos).find(logo => {
      // Make sure it's not some other company logo on the page:
      // We're looking for the one in the section with the fullName in an h2
      const probablyProfileHeader = logo.closest(':has(h2)')
      return probablyProfileHeader?.querySelector('h2')?.innerText === fullName
    })

    data.companyName = companyLogo?.closest('figure')?.nextSibling?.textContent ?? null

    // Get location
    const locationElement = document.querySelector('[data-test-id="top-card-location"]') ||
      document.querySelector('[class*="location"]');
    if (locationElement) {
      data.location = locationElement.textContent?.trim() || '';
    }

    // Get message recipient name from open message conversation
    // The profile card only renders at the top of new conversations, so prefer the header title
    // On profile pages the chat overlay lives inside the #interop-outlet shadow root, invisible to document.querySelector.
    // With several bubbles open, prefer the focused one (all open bubbles carry the --is-active class).
    // Compose bubbles are titled "New message", so read the recipient pill from the To field instead.
    const msgRoot: ParentNode = document.querySelector('#interop-outlet')?.shadowRoot ?? document;
    const msgScope: ParentNode =
      msgRoot.querySelector('.msg-overlay-conversation-bubble:focus-within') ||
      msgRoot.querySelector('.msg-overlay-conversation-bubble') ||
      msgRoot;
    const nameElement =
      msgScope.querySelector('.msg-connections-typeahead__added-recipients .artdeco-pill__text') ||
      msgScope.querySelector('.msg-overlay-conversation-bubble:not(.msg-overlay-conversation-bubble--is-compose) .msg-overlay-bubble-header__title') ||
      msgScope.querySelector('.msg-entity-lockup__entity-title') ||
      msgScope.querySelector('.msg-s-profile-card-one-to-one .profile-card-one-to-one__profile-link span.truncate');
    if (nameElement) {
      const fullName = cleanName(nameElement.textContent || '');
      data.msgFullName = fullName;
      const nameParts = fullName.split(' ').filter(part => part.length > 0);
      data.msgFirstName = nameParts[0] || null;
      data.msgLastName = nameParts.slice(1).join(' ') || null;
    }

    console.log('Scraped LinkedIn data:', data);
  } catch (error) {
    console.error('Error scraping LinkedIn profile:', error);
  }

  return data;
}
