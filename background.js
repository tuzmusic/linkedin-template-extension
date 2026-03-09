// Background service worker for handling keyboard shortcuts

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      console.error('No active tab found');
      return;
    }

    const activeTab = tabs[0];

    // Only trigger on LinkedIn pages
    if (!activeTab.url || !activeTab.url.includes('linkedin.com')) {
      console.warn('Not on a LinkedIn page:', activeTab.url);
      return;
    }

    if (command === 'copy-template') {
      // Only allow on profile pages
      if (!activeTab.url.includes('linkedin.com/in/')) {
        console.warn('Not on a LinkedIn profile page');
        return;
      }
      chrome.tabs.sendMessage(activeTab.id, { action: 'copyTemplate' }).catch((error) => {
        console.error('Failed to send copyTemplate message:', error.message);
      });
    } else if (command === 'click-connect') {
      chrome.tabs.sendMessage(activeTab.id, { action: 'clickConnect' }).catch((error) => {
        console.error('Failed to send clickConnect message:', error.message);
      });
    } else if (command === 'click-add-note') {
      chrome.tabs.sendMessage(activeTab.id, { action: 'clickAddNote' }).catch((error) => {
        console.error('Failed to send clickAddNote message:', error.message);
      });
    }
  });
});

// Initialize default templates on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['savedTemplates', 'currentWork'], (result) => {
    // If no saved templates exist, seed with defaults
    if (!result.savedTemplates || result.savedTemplates.length === 0) {
      const defaultTemplates = [
        {
          id: crypto.randomUUID(),
          title: "Designer outreach",
          template: "Hi {{firstName}}, I noticed you work at {{companyName}} and wanted to reach out. I'm really impressed by your work in {{position}} and would love to connect!"
        },
        {
          id: crypto.randomUUID(),
          title: "Recruiter intro",
          template: "Hello {{firstName}}! I saw your profile and your experience at {{companyName}} caught my attention. I think we could have some great conversations about {{headline}}."
        },
        {
          id: crypto.randomUUID(),
          title: "Sales pitch",
          template: "Hey {{firstName}}, I'm reaching out because I noticed we share similar interests. Your role as {{position}} at {{companyName}} is fascinating. Would you be open to connecting?"
        },
        {
          id: crypto.randomUUID(),
          title: "General networking",
          template: "Hi {{firstName}}, I came across your profile and was impressed by your background at {{companyName}}. I'd love to learn more about your experience in {{position}}!"
        }
      ];

      chrome.storage.sync.set({ savedTemplates: defaultTemplates });
    }

    // If no currentWork exists, initialize with first template
    if (!result.currentWork && result.savedTemplates?.length > 0) {
      const firstTemplate = result.savedTemplates[0];
      chrome.storage.sync.set({
        currentWork: {
          id: firstTemplate.id,
          title: firstTemplate.title,
          template: firstTemplate.template
        }
      });
    }
  });
});
