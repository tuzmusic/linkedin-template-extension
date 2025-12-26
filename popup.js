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
  let templates = result.savedTemplates || [];

  // Pad with dummy templates if fewer than 4 (for testing)
  const dummyTemplates = [
    "Hi {{firstName}}, I noticed you work at {{companyName}} and wanted to reach out. I'm really impressed by your work in {{position}} and would love to connect!",
    "Hello {{firstName}}! I saw your profile and your experience at {{companyName}} caught my attention. I think we could have some great conversations about {{headline}}.",
    "Hey {{firstName}}, I'm reaching out because I noticed we share similar interests. Your role as {{position}} at {{companyName}} is fascinating. Would you be open to connecting?",
    "Hi {{firstName}}, I came across your profile and was impressed by your background at {{companyName}}. I'd love to learn more about your experience in {{position}}!"
  ];

  if (templates.length < 4) {
    const needed = 4 - templates.length;
    templates = [...templates, ...dummyTemplates.slice(0, needed)];
  }

  if (templates.length > 0) {
    templates.forEach((template, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.dataset.template = template;
      // Show full template text
      option.textContent = template;
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
  const selectedOption = recentTemplatesSelect.options[recentTemplatesSelect.selectedIndex];
  if (selectedOption && selectedOption.dataset.template) {
    templateTextarea.value = selectedOption.dataset.template;
    updateCharCount();
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
