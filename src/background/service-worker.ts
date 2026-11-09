import { Template } from '../types';
import { AppStorageState } from "../utils/storage.ts";

// Content scripts only run on LinkedIn, so elsewhere we inject a self-contained copy + toast.
// This function is serialized into the page: it can't reference anything outside itself.
function copyAndToast(text: string) {
  const toast = document.createElement('div');
  toast.style.cssText =
    'position:fixed;top:20px;right:20px;z-index:2147483647;max-width:360px;padding:12px 16px;' +
    'border-radius:8px;background:#16a34a;color:#fff;font:14px/1.4 system-ui,sans-serif;' +
    'box-shadow:0 4px 12px rgba(0,0,0,.25)';
  const show = (ok: boolean) => {
    toast.style.background = ok ? '#16a34a' : '#dc2626';
    toast.innerHTML = ok
      ? '<div><b>Template copied!</b></div><div style="opacity:.9;margin:6px 0;white-space:pre-wrap"></div>' +
        '<div style="font-size:12px;opacity:.9">⚠️ Not on LinkedIn: wildcards left unfilled</div>'
      : 'Failed to copy template';
    const preview = toast.children[1];
    if (preview) preview.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  };
  navigator.clipboard.writeText(text).then(
    () => show(true),
    () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      show(ok);
    }
  );
}

async function copyTemplateOutsideLinkedIn(tabId: number) {
  try {
    const result = await chrome.storage.sync.get<AppStorageState>(['currentWork']);
    const template = result.currentWork?.template || '';
    await chrome.scripting.executeScript({
      target: { tabId },
      func: copyAndToast,
      args: [template]
    });
  } catch (error) {
    // e.g. chrome:// pages, the Web Store, or the PDF viewer can't be scripted
    console.error('Failed to copy template on this page:', error);
  }
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      console.error('No active tab found');
      return;
    }

    const activeTab = tabs[0];
    const tabId = activeTab.id;
    if (!tabId) {
      console.error('No tab ID found');
      return;
    }

    const onLinkedIn = !!activeTab.url && activeTab.url.includes('linkedin.com');

    if (command === 'copy-template') {
      // Works anywhere: on non-LinkedIn pages (e.g. Gmail) the template is copied unfilled
      if (onLinkedIn) {
        chrome.tabs
          .sendMessage(tabId, { action: 'copyTemplate' })
          .catch((error) => {
            console.error('Failed to send copyTemplate message:', error.message);
          });
      } else {
        copyTemplateOutsideLinkedIn(tabId);
      }
      return;
    }

    // Everything else only makes sense on LinkedIn
    if (!onLinkedIn) {
      console.warn('Not on a LinkedIn page:', activeTab.url);
      return;
    }

    if (command === 'click-connect') {
      chrome.tabs
        .sendMessage(tabId, { action: 'clickConnect' })
        .catch((error) => {
          console.error('Failed to send clickConnect message:', error.message);
        });
    } else if (command === 'click-add-note') {
      chrome.tabs
        .sendMessage(tabId, { action: 'clickAddNote' })
        .catch((error) => {
          console.error('Failed to send clickAddNote message:', error.message);
        });
    } else if (command === 'click-send') {
      chrome.tabs
        .sendMessage(tabId, { action: 'clickSend' })
        .catch((error) => {
          console.error('Failed to send clickSend message:', error.message);
        });
    }
  });
});

// Initialize default templates on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get<AppStorageState>(['savedTemplates', 'currentWork'], (result) => {
    // If no saved templates exist, seed with defaults
    if (!result.savedTemplates || result.savedTemplates.length === 0) {
      const defaultTemplates: Template[] = [
        {
          id: crypto.randomUUID(),
          title: 'Designer outreach',
          template:
            "Hi {{firstName}}, I noticed you work at {{companyName}} and wanted to reach out. I'm really impressed by your work in {{position}} and would love to connect!"
        },
        {
          id: crypto.randomUUID(),
          title: 'Recruiter intro',
          template:
            "Hello {{firstName}}! I saw your profile and your experience at {{companyName}} caught my attention. I think we could have some great conversations about {{headline}}."
        },
        {
          id: crypto.randomUUID(),
          title: 'Sales pitch',
          template:
            "Hey {{firstName}}, I'm reaching out because I noticed we share similar interests. Your role as {{position}} at {{companyName}} is fascinating. Would you be open to connecting?"
        },
        {
          id: crypto.randomUUID(),
          title: 'General networking',
          template:
            "Hi {{firstName}}, I came across your profile and was impressed by your background at {{companyName}}. I'd love to learn more about your experience in {{position}}!"
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
