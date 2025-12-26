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
  chrome.storage.sync.get(['messageTemplate', 'savedTemplates'], (result) => {
    if (!result.messageTemplate) {
      // Check if there are any saved templates
      if (result.savedTemplates?.length > 0) {
        // Use the most recent saved template
        chrome.storage.sync.set({
          messageTemplate: result.savedTemplates[0]
        });
      } else {
        // Use the default init message
        chrome.storage.sync.set({
          messageTemplate: "Hi {{firstName}}, I noticed you work at {{companyName}}. I'd love to connect!"
        });
      }
    }
  });
});
