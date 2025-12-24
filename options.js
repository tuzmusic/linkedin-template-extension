// Options page script

const templateTextarea = document.getElementById('template');
const charCountDiv = document.getElementById('charCount');
const saveBtn = document.getElementById('saveBtn');
const savedMessage = document.getElementById('savedMessage');

// Load saved template on page load
chrome.storage.sync.get(['messageTemplate'], (result) => {
  if (result.messageTemplate) {
    templateTextarea.value = result.messageTemplate;
    updateCharCount();
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

// Save template
saveBtn.addEventListener('click', () => {
  const template = templateTextarea.value;

  chrome.storage.sync.set({ messageTemplate: template }, () => {
    // Show saved message
    savedMessage.classList.add('show');

    setTimeout(() => {
      savedMessage.classList.remove('show');
    }, 2000);
  });
});

// Allow Cmd+Enter or Ctrl+Enter to save
templateTextarea.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    saveBtn.click();
  }
});
