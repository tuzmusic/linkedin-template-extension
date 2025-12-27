// Popup script for template management

const templateTextarea = document.getElementById('template');
const templateTitleInput = document.getElementById('templateTitle');
const charCountDiv = document.getElementById('charCount');
const saveBtn = document.getElementById('saveBtn');
const generateTitleBtn = document.getElementById('generateTitleBtn');
const savedMessage = document.getElementById('savedMessage');
const recentTemplatesListbox = document.getElementById('recentTemplates');
const templatePreview = document.getElementById('templatePreview');

let draftSaveTimeout = null;
let currentTemplates = [];
let currentDraft = null;

// Dummy templates for testing
const dummyTemplates = [
  { title: "Designer outreach", template: "Hi {{firstName}}, I noticed you work at {{companyName}} and wanted to reach out. I'm really impressed by your work in {{position}} and would love to connect!" },
  { title: "Recruiter intro", template: "Hello {{firstName}}! I saw your profile and your experience at {{companyName}} caught my attention. I think we could have some great conversations about {{headline}}." },
  { title: "Sales pitch", template: "Hey {{firstName}}, I'm reaching out because I noticed we share similar interests. Your role as {{position}} at {{companyName}} is fascinating. Would you be open to connecting?" },
  { title: "General networking", template: "Hi {{firstName}}, I came across your profile and was impressed by your background at {{companyName}}. I'd love to learn more about your experience in {{position}}!" }
];

// Load templates and draft on popup open
chrome.storage.sync.get(['messageTemplate', 'savedTemplates', 'draftTemplate'], (result) => {
  // Load saved templates and filter out any invalid entries
  let templates = result.savedTemplates || [];
  const originalLength = templates.length;
  templates = templates.filter(t => t && typeof t === 'object' && t.title && t.template);

  // If we filtered out invalid entries, clean up storage
  if (templates.length !== originalLength) {
    chrome.storage.sync.set({ savedTemplates: templates });
  }

  // Pad with dummy templates if fewer than 4 (for testing)
  if (templates.length < 4) {
    const needed = 4 - templates.length;
    templates = [...templates, ...dummyTemplates.slice(0, needed)];
  }

  currentTemplates = templates;

  // Only set currentDraft if it exists and has content
  if (result.draftTemplate && (result.draftTemplate.title || result.draftTemplate.template)) {
    currentDraft = result.draftTemplate;
  } else {
    currentDraft = null;
    // Clear invalid draft from storage
    if (result.draftTemplate) {
      chrome.storage.sync.set({ draftTemplate: null });
    }
  }

  // Populate listbox
  populateTemplateList();

  // Load current template or draft
  if (currentDraft && currentDraft.template) {
    templateTitleInput.value = currentDraft.title || '';
    templateTextarea.value = currentDraft.template;
  } else if (result.messageTemplate) {
    templateTextarea.value = result.messageTemplate;
    templateTitleInput.value = '';
  }

  updateCharCount();
});

// Populate the template listbox
function populateTemplateList() {
  recentTemplatesListbox.innerHTML = '';

  // Add draft if exists
  if (currentDraft && currentDraft.template) {
    const draftItem = createTemplateItem(
      currentDraft.title ? `${currentDraft.title} (in progress)` : '(in progress)',
      currentDraft.template,
      -1,
      true
    );
    if (draftItem) {
      recentTemplatesListbox.appendChild(draftItem);
    }
  }

  // Add saved templates
  currentTemplates.forEach((template, index) => {
    if (template && template.template) {
      const item = createTemplateItem(template.title, template.template, index, false);
      if (item) {
        recentTemplatesListbox.appendChild(item);
      }
    }
  });
}

// Create a template list item
function createTemplateItem(title, template, index, isDraft) {
  // Validate inputs
  if (!template || typeof template !== 'string') {
    console.warn('Invalid template provided to createTemplateItem:', template);
    return null;
  }

  const item = document.createElement('div');
  item.className = 'template-item';
  if (isDraft) {
    item.className += ' draft';
  }
  item.textContent = title || '(Untitled)';
  item.setAttribute('role', 'option');
  item.dataset.index = index;
  item.dataset.template = template;
  item.dataset.title = isDraft ? (currentDraft?.title || '') : (title || '');

  // Set anchor name for popover positioning (must be set directly, not via CSS variable)
  const anchorName = `--template-${isDraft ? 'draft' : index}`;
  item.style.anchorName = anchorName;

  // Click handler to load template
  item.addEventListener('click', () => {
    loadTemplate(item.dataset.title, template);

    // Update selection
    document.querySelectorAll('.template-item').forEach(el => {
      el.setAttribute('aria-selected', 'false');
    });
    item.setAttribute('aria-selected', 'true');
  });

  // Hover handler for preview
  item.addEventListener('mouseenter', (e) => {
    showPreview(template, anchorName);
  });

  item.addEventListener('mouseleave', () => {
    hidePreview();
  });

  return item;
}

// Load a template into the editor
function loadTemplate(title, template) {
  templateTitleInput.value = title;
  templateTextarea.value = template;
  updateCharCount();
}

// Show preview popover
function showPreview(template, anchorName) {
  templatePreview.textContent = template;
  templatePreview.style.positionAnchor = anchorName;

  try {
    templatePreview.showPopover();
  } catch (e) {
    // Fallback if popover API not supported
    console.warn('Popover API not supported:', e);
  }
}

// Hide preview popover
function hidePreview() {
  try {
    templatePreview.hidePopover();
  } catch (e) {
    // Silently fail if popover API not supported
  }
}

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

// Auto-save draft (debounced)
function saveDraft() {
  clearTimeout(draftSaveTimeout);

  draftSaveTimeout = setTimeout(() => {
    const title = templateTitleInput.value;
    const template = templateTextarea.value;

    // Only save if there's content
    if (template.trim() || title.trim()) {
      currentDraft = { title, template };
      chrome.storage.sync.set({ draftTemplate: currentDraft }, () => {
        // Refresh the list to update draft display
        populateTemplateList();
      });
    }
  }, 500);
}

// Generate title from template
function generateTitle() {
  const template = templateTextarea.value.trim();
  if (!template) return;

  // Take first ~50 chars, truncate to last complete word
  let title = template.substring(0, 50);
  const lastSpace = title.lastIndexOf(' ');
  if (lastSpace > 20) { // Only truncate if we have a reasonable amount of text
    title = title.substring(0, lastSpace);
  }

  if (template.length > title.length) {
    title += '...';
  }

  templateTitleInput.value = title;
  saveDraft(); // Save the generated title
}

// Save template
function saveTemplate() {
  const title = templateTitleInput.value.trim();
  const template = templateTextarea.value.trim();

  // Validate title is required
  if (!title) {
    alert('Please enter a title for this template');
    templateTitleInput.focus();
    return;
  }

  if (!template) {
    alert('Template cannot be empty');
    templateTextarea.focus();
    return;
  }

  chrome.storage.sync.get(['savedTemplates'], (result) => {
    let savedTemplates = result.savedTemplates || [];

    // Filter out any invalid entries (old format or corrupted data)
    savedTemplates = savedTemplates.filter(t => t && t.title && t.template);

    // Check if a template with this title already exists
    const existingIndex = savedTemplates.findIndex(t => t.title === title);

    if (existingIndex !== -1) {
      // Update existing template
      savedTemplates[existingIndex] = { title, template };
    } else {
      // Add new template at the beginning
      savedTemplates.unshift({ title, template });
    }

    // Limit to 20 templates
    if (savedTemplates.length > 20) {
      savedTemplates = savedTemplates.slice(0, 20);
    }

    // Save and clear draft
    chrome.storage.sync.set({
      messageTemplate: template,
      savedTemplates: savedTemplates,
      draftTemplate: null
    }, () => {
      // Update current state - pad with dummies if needed
      currentTemplates = savedTemplates;
      if (currentTemplates.length < 4) {
        const needed = 4 - currentTemplates.length;
        currentTemplates = [...currentTemplates, ...dummyTemplates.slice(0, needed)];
      }
      currentDraft = null;

      // Refresh list
      populateTemplateList();

      // Show saved message
      savedMessage.classList.add('show');
      setTimeout(() => {
        savedMessage.classList.remove('show');
      }, 2000);
    });
  });
}

// Event listeners
templateTextarea.addEventListener('input', () => {
  updateCharCount();
  saveDraft();
});

templateTitleInput.addEventListener('input', () => {
  saveDraft();
});

generateTitleBtn.addEventListener('click', generateTitle);
saveBtn.addEventListener('click', saveTemplate);

// Allow Cmd+Enter or Ctrl+Enter to save
templateTextarea.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    saveBtn.click();
  }
});
