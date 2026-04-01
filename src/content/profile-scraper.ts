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

    // Get company name - try from button or experience
    let companyButton = document.querySelector('button[aria-label*="Current company"], button[aria-label*="company"]');
    if (companyButton) {
      const ariaLabel = companyButton.getAttribute('aria-label');
      const match = ariaLabel?.match(/company[:\s]+([^.]+)/i);
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
            const posText = posElement.textContent?.trim() || '';
            if (posText && posText.length < 100) {
              data.position = posText;
            }
          }

          // Look for company
          const compElement = firstItem.querySelector('.base-card__subtitle, [class*="company"], h4');
          if (compElement && !data.companyName) {
            const compText = compElement.textContent?.trim() || '';
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
