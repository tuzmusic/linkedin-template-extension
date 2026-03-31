// Content script for LinkedIn profile pages

// Lazy load modules
let modules = {};

async function loadModule(path) {
  if (!modules[path]) {
    const moduleUrl = chrome.runtime.getURL(`src/lib/${path}`);
    modules[path] = await import(moduleUrl);
  }
  return modules[path];
}

async function getModule(path) {
  return loadModule(path);
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyTemplate') {
    handleCopyTemplate().catch(error => console.error('Error in handleCopyTemplate:', error));
    return true;
  } else if (request.action === 'clickConnect') {
    clickConnect().catch(error => console.error('Error in clickConnect:', error));
    return true;
  } else if (request.action === 'clickAddNote') {
    clickAddNote().catch(error => console.error('Error in clickAddNote:', error));
    return true;
  } else if (request.action === 'clickSend') {
    clickSend().catch(error => console.error('Error in clickSend:', error));
    return true;
  } else if (request.action === 'showNotification') {
    handleShowNotification(request.message, request.type || 'info');
  }
});

// Main action handlers
async function handleCopyTemplate() {
  const mod = await getModule('template/handleCopyTemplate.js');
  return mod.handleCopyTemplate();
}

async function clickConnect() {
  const mod = await getModule('connect/clickConnect.js');
  return mod.clickConnect();
}

async function clickAddNote() {
  const mod = await getModule('ui/clickShadowRootButton.js');
  return mod.clickShadowRootButton('Add a note');
}

async function clickSend() {
  const mod = await getModule('ui/clickShadowRootButton.js');
  return mod.clickShadowRootButton('Send invitation');
}

async function handleShowNotification(message, type) {
  const mod = await getModule('utils/showNotification.js');
  return mod.showNotification(message, type);
}
