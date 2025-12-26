// Popup script for template management

const templateTextarea = document.getElementById('template');
const charCountDiv = document.getElementById('charCount');
const saveBtn = document.getElementById('saveBtn');
const savedMessage = document.getElementById('savedMessage');
const recentTemplatesSelect = document.getElementById('recentTemplates');

// Load saved template and recent templates on popup open
chrome.storage.sync.get(['messageTemplate', 'savedTemplates'], (result) => {
  // Load current template
  if (result.messageTemplate) {
    templateTextarea.value = result.messageTemplate;
    updateCharCount();
  }

  // Load recent templates into dropdown
  if (result.savedTemplates && result.savedTemplates.length > 0) {
    result.savedTemplates.forEach((template, index) => {
      const option = document.createElement('option');
      option.value = index;
      // Show first 50 characters as preview
      const preview = template.length > 50 ? template.substring(0, 50) + '...' : template;
      option.textContent = preview;
      recentTemplatesSelect.appendChild(option);
    });
  }
});

// Update character count
function updateCharCount() {
  const count = templateTextarea.value.length;
  charCountDiv.textContent = `${count}/300 characters`;

  if (count > 300) {
    charCountDiv.classList.add('over-limit');
  } else {
    charCountDiv.classList.remove('over-limit');
  }
}

// Listen for input changes
templateTextarea.addEventListener('input', updateCharCount);

// Handle recent template selection
recentTemplatesSelect.addEventListener('change', () => {
  const selectedIndex = recentTemplatesSelect.value;
  if (selectedIndex !== '') {
    chrome.storage.sync.get(['savedTemplates'], (result) => {
      if (result.savedTemplates && result.savedTemplates[selectedIndex]) {
        templateTextarea.value = result.savedTemplates[selectedIndex];
        updateCharCount();
      }
    });
  }
});

// Save template
saveBtn.addEventListener('click', () => {
  const template = templateTextarea.value;

  chrome.storage.sync.get(['savedTemplates'], (result) => {
    let savedTemplates = result.savedTemplates || [];

    // Check if this template already exists
    const existingIndex = savedTemplates.indexOf(template);

    if (existingIndex !== -1) {
      // Remove it from current position
      savedTemplates.splice(existingIndex, 1);
    }

    // Add to beginning (most recent first)
    savedTemplates.unshift(template);

    // Limit to 20 templates
    if (savedTemplates.length > 20) {
      savedTemplates = savedTemplates.slice(0, 20);
    }

    // Save both the current template and the updated savedTemplates array
    chrome.storage.sync.set({
      messageTemplate: template,
      savedTemplates: savedTemplates
    }, () => {
      // Show saved message
      savedMessage.classList.add('show');

      setTimeout(() => {
        savedMessage.classList.remove('show');
      }, 2000);
    });
  });
});

// Allow Cmd+Enter or Ctrl+Enter to save
templateTextarea.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    saveBtn.click();
  }
});
