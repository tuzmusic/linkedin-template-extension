// Background service worker for handling keyboard shortcuts

chrome.commands.onCommand.addListener((command) => {
  if (command === 'copy-template') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      // Only trigger on LinkedIn profile pages
      if (activeTab.url && activeTab.url.includes('linkedin.com/in/')) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'copyTemplate' });
      } else {
        // Show notification if not on a profile page
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'showNotification',
          message: 'Please navigate to a LinkedIn profile page',
          type: 'error'
        });
      }
    });
  }
});

// Initialize default template on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['messageTemplate'], (result) => {
    if (!result.messageTemplate) {
      chrome.storage.sync.set({
        messageTemplate: "Hi {{firstName}}, I noticed you work at {{companyName}}. I'd love to connect!"
      });
    }
  });
});
