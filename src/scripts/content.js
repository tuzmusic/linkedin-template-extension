// Content script for LinkedIn profile pages

// Lazy load modules with absolute URLs
let modules = {};

async function loadModule(path) {
  if (!modules[path]) {
    const moduleUrl = chrome.runtime.getURL(`src/lib/${path}`);
    modules[path] = await import(moduleUrl);
  }
  return modules[path];
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyTemplate') {
    loadModule('template/handleCopyTemplate.js')
      .then(mod => mod.handleCopyTemplate())
      .catch(error => console.error('Error in handleCopyTemplate:', error));
    return true;
  } else if (request.action === 'clickConnect') {
    loadModule('connect/clickConnect.js')
      .then(mod => mod.clickConnect())
      .catch(error => console.error('Error in clickConnect:', error));
    return true;
  } else if (request.action === 'clickAddNote') {
    loadModule('ui/clickShadowRootButton.js')
      .then(mod => mod.clickShadowRootButton('Add a note'))
      .catch(error => console.error('Error in clickAddNote:', error));
    return true;
  } else if (request.action === 'clickSend') {
    loadModule('ui/clickShadowRootButton.js')
      .then(mod => mod.clickShadowRootButton('Send invitation'))
      .catch(error => console.error('Error in clickSend:', error));
    return true;
  } else if (request.action === 'showNotification') {
    loadModule('utils/showNotification.js')
      .then(mod => mod.showNotification(request.message, request.type || 'info'))
      .catch(error => console.error('Error in showNotification:', error));
  }
});

