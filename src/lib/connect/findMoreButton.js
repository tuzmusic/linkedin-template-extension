export function findMoreButton(maxLevels = 10) {
  const contactInfoSelector = 'a[href*=contact-info]';
  let container = document.querySelector(contactInfoSelector);
  let levels = 0;

  const getMoreButton = () => container.querySelector('button[aria-label="More"]');
  let moreButton = getMoreButton();

  // Traverse up the DOM tree to find the common ancestor that contains the More button
  while (container && levels < maxLevels && !moreButton) {
    container = container.parentElement;
    moreButton = getMoreButton();
    levels++;
  }

  return moreButton;
}
