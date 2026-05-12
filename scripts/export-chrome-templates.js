// Paste this into the DevTools console on the extension's Options page.
// After running, paste the clipboard contents into scripts/templates-export.json
chrome.storage.sync.get(['savedTemplates'], (result) => {
  const templates = result.savedTemplates ?? [];
  copy(JSON.stringify(templates, null, 2));
  console.log(`✓ Copied ${templates.length} template(s) to clipboard — paste into scripts/templates-export.json`);
  console.table(templates.map(t => ({ id: t.id, title: t.title })));
});
