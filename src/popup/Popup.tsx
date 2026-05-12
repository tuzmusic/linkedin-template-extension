import { useEffect, useState } from 'preact/hooks';
import { CurrentWork, MAX_TEMPLATES, SortConfig, Template } from '../types';
import {
  createTemplateInDb,
  deleteTemplateFromDb,
  fetchTemplatesFromDb,
  loadData,
  saveData,
  updateTemplateInDb
} from '../utils/storage';
import { Button } from '../components/Button';
import { WildcardsPanel } from './WildcardPanel';
import { TemplateEditor } from './TemplateEditor';
import { TemplatesList } from './TemplatesList';
import { SaveAsDialog } from './SaveAsDialog';

export const Popup = ({ userEmail, onSignOut }: { userEmail?: string; onSignOut?: () => void }) => {
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [currentWork, setCurrentWork] = useState<CurrentWork>({
    id: null,
    title: '',
    template: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'created_at', dir: 'desc' });
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsTitle, setSaveAsTitle] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<number | null>(null);
  const [charLimit, setCharLimit] = useState(300);
  const [charLimitEnabled, setCharLimitEnabled] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [offlineModalDismissed, setOfflineModalDismissed] = useState(false);

  useEffect(function loadDataOnMount() {
    loadData().then((data) => {
      setSavedTemplates(data.savedTemplates);
      if (data.currentWork) {
        setCurrentWork(data.currentWork);
      }
      setCharLimit(data.charLimit);
      setCharLimitEnabled(data.charLimitEnabled);
    });

    const timeout = window.setTimeout(() => {
      setDbError(true);
    }, 10000);

    fetchTemplatesFromDb()
      .then((dbTemplates) => {
        clearTimeout(timeout);
        if (dbTemplates.length > 0) {
          setSavedTemplates(dbTemplates);
          saveData({ savedTemplates: dbTemplates });
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        setDbError(true);
      });

    return () => clearTimeout(timeout);
  }, []);

  const handleCharLimitChange = (value: number) => {
    setCharLimit(value);
    saveData({ charLimit: value });
  };

  const handleCharLimitEnabledChange = (enabled: boolean) => {
    setCharLimitEnabled(enabled);
    saveData({ charLimitEnabled: enabled });
  };

  const resyncFromDb = async () => {
    try {
      const dbTemplates = await fetchTemplatesFromDb();
      setSavedTemplates(dbTemplates);
      saveData({ savedTemplates: dbTemplates });
    } catch {
      // resync is best-effort; the calling code already shows an alert
    }
  };

  const handleTitleChange = (title: string) => {
    setCurrentWork({ ...currentWork, title });
    debounceAutoSave({ ...currentWork, title }, savedTemplates);
  };

  const handleTemplateChange = (template: string) => {
    setCurrentWork({ ...currentWork, template });
    debounceAutoSave({ ...currentWork, template }, savedTemplates);
  };

  const debounceAutoSave = (work: CurrentWork, templates: Template[]) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = window.setTimeout(() => {
      saveData({ currentWork: work });
    }, 500);

    setAutoSaveTimeout(timeout);
  };

  const handleGenerateTitle = () => {
    const template = currentWork.template.trim();
    if (!template) return;

    let title = template.substring(0, 50);
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 20) {
      title = title.substring(0, lastSpace);
    }

    if (template.length > title.length) {
      title += '...';
    }

    handleTitleChange(title);
  };

  const handleNew = () => {
    const hasChanges =
      currentWork.title.trim() !== '' || currentWork.template.trim() !== '';

    if (hasChanges) {
      const confirmNew = confirm(
        'You have unsaved changes. Discard changes and create new template?'
      );
      if (!confirmNew) return;
    }

    const newWork: CurrentWork = {
      id: null,
      title: '',
      template: ''
    };

    setCurrentWork(newWork);
    setSearchQuery('');
    saveData({ currentWork: newWork });
  };

  const handleSave = async () => {
    const title = currentWork.title.trim();
    const template = currentWork.template.trim();

    if (!title) {
      alert('Please enter a title for this template');
      return;
    }

    if (!template) {
      alert('Template cannot be empty');
      return;
    }

    let newTemplates = [...savedTemplates];
    let savedId = currentWork.id;

    if (currentWork.id) {
      const index = newTemplates.findIndex((t) => t.id === currentWork.id);
      if (index !== -1) {
        newTemplates[index] = { id: currentWork.id, title, template };
      }
      if (newTemplates.length > MAX_TEMPLATES) newTemplates = newTemplates.slice(0, MAX_TEMPLATES);
      const newWork = { id: savedId, title, template };
      setSavedTemplates(newTemplates);
      setCurrentWork(newWork);
      saveData({ savedTemplates: newTemplates, currentWork: newWork, messageTemplate: template });

      if (dbError) {
        showSavedMessageBriefly('Saved locally (offline)');
        return;
      }

      showSavedMessageBriefly();
      const ok = await updateTemplateInDb(currentWork.id, title, template);
      if (!ok) {
        alert('Failed to save template. Your changes have been reverted.');
        await resyncFromDb();
      }
    } else {
      if (dbError) {
        savedId = crypto.randomUUID();
        const newTemplate: Template = { id: savedId, title, template };
        newTemplates.unshift(newTemplate);
        if (newTemplates.length > MAX_TEMPLATES) newTemplates = newTemplates.slice(0, MAX_TEMPLATES);
        const newWork = { id: savedId, title, template };
        setSavedTemplates(newTemplates);
        setCurrentWork(newWork);
        showSavedMessageBriefly('Saved locally (offline)');
        saveData({ savedTemplates: newTemplates, currentWork: newWork, messageTemplate: template });
        return;
      }

      // Await DB insert to get the generated id before updating local state
      const created = await createTemplateInDb(title, template);
      if (!created) {
        alert('Failed to save template. Please try again.');
        return;
      }
      savedId = created.id;
      const newTemplate: Template = { id: savedId, title, template };
      newTemplates.unshift(newTemplate);
      if (newTemplates.length > MAX_TEMPLATES) newTemplates = newTemplates.slice(0, MAX_TEMPLATES);
      const newWork = { id: savedId, title, template };
      setSavedTemplates(newTemplates);
      setCurrentWork(newWork);
      showSavedMessageBriefly();
      saveData({ savedTemplates: newTemplates, currentWork: newWork, messageTemplate: template });
    }
  };

  const handleSaveAsNew = () => {
    const currentTitle = currentWork.title.trim();

    if (currentTitle) {
      const exists = savedTemplates.some((t) => t.title === currentTitle);
      setSaveAsTitle(exists ? `${currentTitle} copy` : currentTitle);
    } else {
      setSaveAsTitle('');
    }

    setShowSaveAsDialog(true);
  };

  const handleConfirmSaveAs = async () => {
    const newTitle = saveAsTitle.trim();
    const template = currentWork.template.trim();

    if (!newTitle) {
      alert('Please enter a title');
      return;
    }

    if (!template) {
      alert('Template cannot be empty');
      setShowSaveAsDialog(false);
      return;
    }

    let newId: string;

    if (dbError) {
      newId = crypto.randomUUID();
    } else {
      const created = await createTemplateInDb(newTitle, template);
      if (!created) {
        alert('Failed to save template. Please try again.');
        setShowSaveAsDialog(false);
        return;
      }
      newId = created.id;
    }

    const newTemplate: Template = { id: newId, title: newTitle, template };
    let newTemplates = [newTemplate, ...savedTemplates];
    if (newTemplates.length > MAX_TEMPLATES) newTemplates = newTemplates.slice(0, MAX_TEMPLATES);

    const newWork = { id: newId, title: newTitle, template };
    setSavedTemplates(newTemplates);
    setCurrentWork(newWork);
    setShowSaveAsDialog(false);
    showSavedMessageBriefly(dbError ? 'Saved locally (offline)' : 'Template saved!');

    saveData({ savedTemplates: newTemplates, currentWork: newWork, messageTemplate: template });
  };

  const handleSelectTemplate = (template: Template) => {
    const hasChanges =
      (currentWork.id === null &&
        (currentWork.title.trim() !== '' || currentWork.template.trim() !== '')) ||
      (currentWork.id !== null &&
        (savedTemplates.find((t) => t.id === currentWork.id)?.title !==
          currentWork.title ||
          savedTemplates.find((t) => t.id === currentWork.id)?.template !==
            currentWork.template));

    if (hasChanges) {
      const confirmSwitch = confirm(
        'You have unsaved changes. Discard changes and switch templates?'
      );
      if (!confirmSwitch) return;
    }

    const newWork: CurrentWork = {
      id: template.id,
      title: template.title,
      template: template.template
    };

    setCurrentWork(newWork);
    setSearchQuery('');
    saveData({ currentWork: newWork });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const templateToDelete = savedTemplates.find((t) => t.id === templateId);
    if (!templateToDelete) return;

    if (!confirm(`Delete "${templateToDelete.title}"?`)) {
      return;
    }

    // Optimistically update local state
    let newTemplates = savedTemplates.filter((t) => t.id !== templateId);
    let newWork = currentWork;

    if (currentWork.id === templateId) {
      if (newTemplates.length > 0) {
        const firstTemplate = newTemplates[0];
        newWork = { id: firstTemplate.id, title: firstTemplate.title, template: firstTemplate.template };
      } else {
        newWork = { id: null, title: '', template: '' };
      }
    }

    setSavedTemplates(newTemplates);
    setCurrentWork(newWork);
    saveData({ savedTemplates: newTemplates, currentWork: newWork });

    if (!dbError) {
      const ok = await deleteTemplateFromDb(templateId);
      if (!ok) {
        alert('Failed to delete template. It has been restored.');
        await resyncFromDb();
      }
    }
  };

  const handleInsertWildcard = (wildcard: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const value = textarea.value;

    const newValue =
      value.substring(0, startPos) + wildcard + value.substring(endPos);
    const newCursorPos = startPos + wildcard.length;

    setCurrentWork({
      ...currentWork,
      template: newValue
    });

    textarea.focus();
    setTimeout(() => {
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
    }, 0);

    debounceAutoSave(
      { ...currentWork, template: newValue },
      savedTemplates
    );
  };

  const showSavedMessageBriefly = (msg = 'Template saved!') => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleTestMessageSent = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url?.includes('linkedin.com')) {
      alert('Navigate to a LinkedIn page first');
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action: 'testMessageSent' });
  };

  return (
    <div class="w-full">
      {dbError && !offlineModalDismissed && (
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-5 mx-4 max-w-xs shadow-lg">
            <p class="text-sm font-semibold text-red-600 mb-2">Database offline</p>
            <p class="text-xs text-text-secondary mb-4">
              Could not connect to Supabase. You can still use cached templates, but saves will fail.
              {import.meta.env.DEV && ' Make sure Supabase is running.'}
            </p>
            <button
              type="button"
              onClick={() => setOfflineModalDismissed(true)}
              class="w-full px-3 py-1.5 text-xs bg-bg-lighter border border-border rounded cursor-pointer hover:bg-state-selected"
            >
              Continue offline
            </button>
          </div>
        </div>
      )}
      <div class="mb-4">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold m-0 text-black">
            LinkedIn Secret Weapon
          </h1>
          <div class="flex items-center gap-2">
            {dbError && (
              <span class="text-xs text-red-500 font-medium">● Offline</span>
            )}
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={handleTestMessageSent}
                class="px-2 py-1 text-xs bg-bg-lighter border border-border rounded cursor-pointer hover:bg-state-selected"
              >
                Test
              </button>
            )}
          </div>
        </div>
        {userEmail && (
          <div class="text-xs text-text-secondary mt-0.5">
            {userEmail}
            {onSignOut && (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={onSignOut}
                  class="underline cursor-pointer bg-none border-none p-0 text-xs text-text-secondary hover:text-text-primary"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <WildcardsPanel onInsert={handleInsertWildcard}/>

      <TemplateEditor
        title={currentWork.title}
        template={currentWork.template}
        onTitleChange={handleTitleChange}
        onTemplateChange={handleTemplateChange}
        onGenerateTitle={handleGenerateTitle}
        charLimit={charLimit}
        charLimitEnabled={charLimitEnabled}
        onCharLimitChange={handleCharLimitChange}
        onCharLimitEnabledChange={handleCharLimitEnabledChange}
      />

      <div class="flex gap-2 mb-4 justify-between">
        <Button onClick={handleNew} variant="secondary">New</Button>
        <Button onClick={handleSave} variant="primary">Save</Button>
        <Button onClick={handleSaveAsNew} variant="secondary">Save As</Button>
      </div>

      {saveMessage && (
        <div class="text-center text-state-success text-xs mb-4 opacity-100 transition-opacity">
          {saveMessage}
        </div>
      )}

      <TemplatesList
        templates={savedTemplates}
        currentWork={currentWork}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        onSelect={handleSelectTemplate}
        onDelete={handleDeleteTemplate}
      />

      <SaveAsDialog
        isOpen={showSaveAsDialog}
        title={saveAsTitle}
        onTitleChange={setSaveAsTitle}
        onConfirm={handleConfirmSaveAs}
        onCancel={() => setShowSaveAsDialog(false)}
      />

      <div class="text-center text-xs text-text-secondary mt-4 pt-4 border-t border-bg-lighter">
        On any LinkedIn profile, press <kbd
        class="bg-bg px-1.5 py-0.5 rounded text-xs border border-border">Opt+V</kbd> to copy your personalized
        message
      </div>
    </div>
  );
};
