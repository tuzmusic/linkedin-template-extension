// Popup script for template management

const templateTextarea = document.getElementById('template');
const templateTitleInput = document.getElementById('templateTitle');
const charCountDiv = document.getElementById('charCount');
const saveBtn = document.getElementById('saveBtn');
const saveAsBtn = document.getElementById('saveAsBtn');
const newBtn = document.getElementById('newBtn');
const generateTitleBtn = document.getElementById('generateTitleBtn');
const savedMessage = document.getElementById('savedMessage');
const templatesListbox = document.getElementById('recentTemplates');
const saveAsDialog = document.getElementById('saveAsDialog');
const saveAsTitle = document.getElementById('saveAsTitle');
const saveAsConfirm = document.getElementById('saveAsConfirm');
const saveAsCancel = document.getElementById('saveAsCancel');

let currentWork = null;
let savedTemplates = [];
let autoSaveTimeout = null;

// Load currentWork and savedTemplates on popup open
chrome.storage.sync.get(['currentWork', 'savedTemplates'], (result) => {
  savedTemplates = result.savedTemplates || [];
  currentWork = result.currentWork || null;

  // If no currentWork but we have templates, load first one
  if (!currentWork && savedTemplates.length > 0) {
    const firstTemplate = savedTemplates[0];
    currentWork = {
      id: firstTemplate.id,
      title: firstTemplate.title,
      template: firstTemplate.template
    };
  }

  // If still no currentWork, initialize empty
  if (!currentWork) {
    currentWork = {
      id: null,
      title: '',
      template: ''
    };
  }

  // Load currentWork into editor
  templateTitleInput.value = currentWork.title || '';
  templateTextarea.value = currentWork.template || '';
  updateCharCount();

  // Populate templates list
  populateTemplatesList();
});

// Check if there are unsaved changes
function hasUnsavedChanges() {
  // Get current editor values
  const currentTitle = templateTitleInput.value;
  const currentTemplate = templateTextarea.value;

  // If it's a draft (no ID), check if there's any content
  if (currentWork.id === null) {
    return currentTitle.trim() !== '' || currentTemplate.trim() !== '';
  }

  // If it's a saved template, compare with saved version
  const savedVersion = savedTemplates.find(t => t.id === currentWork.id);
  if (!savedVersion) return false;

  return savedVersion.title !== currentTitle || savedVersion.template !== currentTemplate;
}

// Populate the templates listbox
function populateTemplatesList() {
  templatesListbox.innerHTML = '';

  // Check if currentWork should be shown as draft or edited
  const isDraft = currentWork.id === null;
  const isEdited = hasUnsavedChanges() && !isDraft;

  // Show draft/edited at top if applicable
  if (isDraft || isEdited) {
    const statusText = isDraft ? '(draft)' : '(edited)';
    const displayTitle = currentWork.title ? `${currentWork.title} ${statusText}` : statusText;
    const item = createTemplateItem(displayTitle, currentWork, true, isDraft ? 'draft' : 'edited');
    templatesListbox.appendChild(item);
  }

  // Show all saved templates
  savedTemplates.forEach((template) => {
    // Skip if this is the current work (already shown above as edited)
    if (isEdited && template.id === currentWork.id) {
      return;
    }

    const item = createTemplateItem(template.title, template, false, null);
    templatesListbox.appendChild(item);
  });
}

// Create a template list item
function createTemplateItem(displayTitle, template, isCurrent, statusClass) {
  const item = document.createElement('div');
  item.className = 'template-item';
  if (statusClass) {
    item.classList.add(statusClass);
  }
  item.setAttribute('role', 'option');

  // Mark as selected if it's the current work
  if (isCurrent) {
    item.setAttribute('aria-selected', 'true');
  }

  // Add tooltip showing full template text on the whole row
  item.title = template.template;

  // Create title span
  const titleSpan = document.createElement('span');
  titleSpan.className = 'template-item-title';
  titleSpan.textContent = displayTitle;

  // Click handler to load template
  titleSpan.addEventListener('click', () => {
    if (isCurrent) return; // Already loaded

    // Check if there are unsaved changes
    if (hasUnsavedChanges()) {
      const confirmSwitch = confirm('You have unsaved changes. Discard changes and switch templates?');
      if (!confirmSwitch) {
        return; // User cancelled, stay on current template
      }
    }

    // Load the template
    currentWork = {
      id: template.id,
      title: template.title,
      template: template.template
    };

    templateTitleInput.value = currentWork.title || '';
    templateTextarea.value = currentWork.template || '';
    updateCharCount();

    // Save to storage and refresh list
    chrome.storage.sync.set({ currentWork }, () => {
      populateTemplatesList();
    });
  });

  item.appendChild(titleSpan);

  // Add delete button only for saved templates (not draft/edited)
  if (!statusClass && template.id) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'template-item-delete';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete template';

    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the item click
      deleteTemplate(template.id);
    });

    item.appendChild(deleteBtn);
  }

  return item;
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

// Auto-save currentWork (debounced)
function autoSave() {
  clearTimeout(autoSaveTimeout);

  autoSaveTimeout = setTimeout(() => {
    currentWork.title = templateTitleInput.value;
    currentWork.template = templateTextarea.value;

    chrome.storage.sync.set({ currentWork }, () => {
      populateTemplatesList();
    });
  }, 500);
}

// Generate title from template
function generateTitle() {
  const template = templateTextarea.value.trim();
  if (!template) return;

  // Take first ~50 chars, truncate to last complete word
  let title = template.substring(0, 50);
  const lastSpace = title.lastIndexOf(' ');
  if (lastSpace > 20) {
    title = title.substring(0, lastSpace);
  }

  if (template.length > title.length) {
    title += '...';
  }

  templateTitleInput.value = title;
  autoSave();
}

// New button - clear editor
function createNew() {
  // Check if there are unsaved changes
  if (hasUnsavedChanges()) {
    const confirmNew = confirm('You have unsaved changes. Discard changes and create new template?');
    if (!confirmNew) {
      return; // User cancelled
    }
  }

  currentWork = {
    id: null,
    title: '',
    template: ''
  };

  templateTitleInput.value = '';
  templateTextarea.value = '';
  updateCharCount();

  chrome.storage.sync.set({ currentWork }, () => {
    populateTemplatesList();
  });
}

// Save button - save or update template
function save() {
  const title = templateTitleInput.value.trim();
  const template = templateTextarea.value.trim();

  // Validate
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

  // If currentWork has an ID, update that template
  // Otherwise, create a new one
  if (currentWork.id) {
    // Update existing template
    const index = savedTemplates.findIndex(t => t.id === currentWork.id);
    if (index !== -1) {
      savedTemplates[index] = {
        id: currentWork.id,
        title,
        template
      };
    }
  } else {
    // Create new template
    const newTemplate = {
      id: crypto.randomUUID(),
      title,
      template
    };
    savedTemplates.unshift(newTemplate);

    // Update currentWork to point to this new template
    currentWork.id = newTemplate.id;
  }

  // Update currentWork
  currentWork.title = title;
  currentWork.template = template;

  // Limit to 20 templates
  if (savedTemplates.length > 20) {
    savedTemplates = savedTemplates.slice(0, 20);
  }

  // Save to storage
  chrome.storage.sync.set({
    savedTemplates,
    currentWork,
    messageTemplate: template // For backward compatibility with content script
  }, () => {
    populateTemplatesList();
    showSavedMessage();
  });
}

// Save As New button - open dialog
function saveAsNew() {
  const currentTitle = templateTitleInput.value.trim();

  // Pre-fill with current title or append " copy"
  if (currentTitle) {
    // Check if this title exists
    const exists = savedTemplates.some(t => t.title === currentTitle);
    saveAsTitle.value = exists ? `${currentTitle} copy` : currentTitle;
  } else {
    saveAsTitle.value = '';
  }

  saveAsDialog.showModal();
  saveAsTitle.focus();
  saveAsTitle.select();
}

// Save As Confirm - save with new title
function confirmSaveAs() {
  const newTitle = saveAsTitle.value.trim();
  const template = templateTextarea.value.trim();

  if (!newTitle) {
    alert('Please enter a title');
    saveAsTitle.focus();
    return;
  }

  if (!template) {
    alert('Template cannot be empty');
    saveAsDialog.close();
    templateTextarea.focus();
    return;
  }

  // Create new template with new ID
  const newTemplate = {
    id: crypto.randomUUID(),
    title: newTitle,
    template
  };

  savedTemplates.unshift(newTemplate);

  // Update currentWork to this new template
  currentWork = {
    id: newTemplate.id,
    title: newTitle,
    template
  };

  templateTitleInput.value = newTitle;

  // Limit to 20 templates
  if (savedTemplates.length > 20) {
    savedTemplates = savedTemplates.slice(0, 20);
  }

  // Save to storage
  chrome.storage.sync.set({
    savedTemplates,
    currentWork,
    messageTemplate: template
  }, () => {
    saveAsDialog.close();
    populateTemplatesList();
    showSavedMessage();
  });
}

// Show saved message
function showSavedMessage() {
  savedMessage.classList.add('show');
  setTimeout(() => {
    savedMessage.classList.remove('show');
  }, 2000);
}

// Delete template by ID
function deleteTemplate(templateId) {
  // Find the template to get its title for confirmation
  const templateToDelete = savedTemplates.find(t => t.id === templateId);
  if (!templateToDelete) return;

  // Confirm deletion
  if (!confirm(`Delete "${templateToDelete.title}"?`)) {
    return;
  }

  // Remove from savedTemplates
  savedTemplates = savedTemplates.filter(t => t.id !== templateId);

  // If we deleted the currentWork, load a different template or create new
  if (currentWork.id === templateId) {
    if (savedTemplates.length > 0) {
      // Load the first template
      const firstTemplate = savedTemplates[0];
      currentWork = {
        id: firstTemplate.id,
        title: firstTemplate.title,
        template: firstTemplate.template
      };
    } else {
      // No templates left, create new
      currentWork = {
        id: null,
        title: '',
        template: ''
      };
    }

    // Update UI
    templateTitleInput.value = currentWork.title || '';
    templateTextarea.value = currentWork.template || '';
    updateCharCount();
  }

  // Save to storage
  chrome.storage.sync.set({
    savedTemplates,
    currentWork
  }, () => {
    populateTemplatesList();
  });
}

// Event listeners
templateTextarea.addEventListener('input', () => {
  updateCharCount();
  autoSave();
});

templateTitleInput.addEventListener('input', autoSave);

generateTitleBtn.addEventListener('click', generateTitle);
newBtn.addEventListener('click', createNew);
saveBtn.addEventListener('click', save);
saveAsBtn.addEventListener('click', saveAsNew);
saveAsConfirm.addEventListener('click', confirmSaveAs);
saveAsCancel.addEventListener('click', () => saveAsDialog.close());

// Allow Cmd+Enter or Ctrl+Enter to save
templateTextarea.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    saveBtn.click();
  }
});

// Close dialog on Escape
saveAsDialog.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    saveAsDialog.close();
  }
});
