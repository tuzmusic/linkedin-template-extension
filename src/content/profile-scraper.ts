export interface LinkedInProfileData {
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  companyName: string;
  position: string;
  location: string;
  profileUrl: string;
  msgFirstName: string | null;
  msgLastName: string | null;
  msgFullName: string | null;
}

export function scrapeLinkedInProfile(): LinkedInProfileData {
  const data: LinkedInProfileData = {
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

    data.companyName = companyLogo?.closest('figure')?.nextSibling?.innerText

    // Get location
    const locationElement = document.querySelector('[data-test-id="top-card-location"]') ||
      document.querySelector('[class*="location"]');
    if (locationElement) {
      data.location = locationElement.textContent?.trim() || '';
    }

    // Get message recipient name from open message conversation
    const msgProfileCard = document.querySelector('.msg-s-profile-card-one-to-one');
    if (msgProfileCard) {
      const nameElement = msgProfileCard.querySelector('.profile-card-one-to-one__profile-link span.truncate');
      if (nameElement) {
        const fullName = nameElement.textContent?.trim() || '';
        data.msgFullName = fullName;
        const nameParts = fullName.split(' ').filter(part => part.length > 0);
        data.msgFirstName = nameParts[0] || null;
        data.msgLastName = nameParts.slice(1).join(' ') || null;
      }
    }

    console.log('Scraped LinkedIn data:', data);
  } catch (error) {
    console.error('Error scraping LinkedIn profile:', error);
  }

  return data;
}
