import { useState, useEffect } from 'preact/hooks';
import { Template, CurrentWork, MAX_TEMPLATES } from '../types';
import { loadData, saveData } from '../utils/storage';
import { WildcardsPanel } from './WildcardPanel';
import { TemplateEditor } from './TemplateEditor';
import { TemplatesList } from './TemplatesList';
import { SaveAsDialog } from './SaveAsDialog';

export const Popup = () => {
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [currentWork, setCurrentWork] = useState<CurrentWork>({
    id: null,
    title: '',
    template: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsTitle, setSaveAsTitle] = useState('');
  const [saveMessage, setSaveMessage] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<number | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData().then((data) => {
      setSavedTemplates(data.savedTemplates);
      if (data.currentWork) {
        setCurrentWork(data.currentWork);
      }
    });
  }, []);

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

  const handleSave = () => {
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

    if (currentWork.id) {
      // Update existing template
      const index = newTemplates.findIndex((t) => t.id === currentWork.id);
      if (index !== -1) {
        newTemplates[index] = {
          id: currentWork.id,
          title,
          template
        };
      }
    } else {
      // Create new template
      const newTemplate: Template = {
        id: crypto.randomUUID(),
        title,
        template
      };
      newTemplates.unshift(newTemplate);
      setCurrentWork({ ...currentWork, id: newTemplate.id });
    }

    // Limit to MAX_TEMPLATES
    if (newTemplates.length > MAX_TEMPLATES) {
      newTemplates = newTemplates.slice(0, MAX_TEMPLATES);
    }

    setSavedTemplates(newTemplates);
    showSavedMessageBriefly();

    saveData({
      savedTemplates: newTemplates,
      currentWork: { ...currentWork, title, template },
      messageTemplate: template
    });
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

  const handleConfirmSaveAs = () => {
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

    const newTemplate: Template = {
      id: crypto.randomUUID(),
      title: newTitle,
      template
    };

    let newTemplates = [newTemplate, ...savedTemplates];

    // Limit to MAX_TEMPLATES
    if (newTemplates.length > MAX_TEMPLATES) {
      newTemplates = newTemplates.slice(0, MAX_TEMPLATES);
    }

    setSavedTemplates(newTemplates);
    setCurrentWork({
      id: newTemplate.id,
      title: newTitle,
      template
    });
    setShowSaveAsDialog(false);
    showSavedMessageBriefly();

    saveData({
      savedTemplates: newTemplates,
      currentWork: {
        id: newTemplate.id,
        title: newTitle,
        template
      },
      messageTemplate: template
    });
  };

  const handleSelectTemplate = (template: Template) => {
    const hasChanges =
      currentWork.title.trim() !== '' ||
      currentWork.template.trim() !== '' ||
      (currentWork.id !== null &&
        savedTemplates.find((t) => t.id === currentWork.id)?.title !==
          currentWork.title) ||
      (currentWork.id !== null &&
        savedTemplates.find((t) => t.id === currentWork.id)?.template !==
          currentWork.template);

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

  const handleDeleteTemplate = (templateId: string) => {
    const templateToDelete = savedTemplates.find((t) => t.id === templateId);
    if (!templateToDelete) return;

    if (!confirm(`Delete "${templateToDelete.title}"?`)) {
      return;
    }

    let newTemplates = savedTemplates.filter((t) => t.id !== templateId);
    let newWork = currentWork;

    if (currentWork.id === templateId) {
      if (newTemplates.length > 0) {
        const firstTemplate = newTemplates[0];
        newWork = {
          id: firstTemplate.id,
          title: firstTemplate.title,
          template: firstTemplate.template
        };
      } else {
        newWork = {
          id: null,
          title: '',
          template: ''
        };
      }
    }

    setSavedTemplates(newTemplates);
    setCurrentWork(newWork);

    saveData({
      savedTemplates: newTemplates,
      currentWork: newWork
    });
  };

  const handleInsertWildcard = (wildcard: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  const showSavedMessageBriefly = () => {
    setSaveMessage(true);
    setTimeout(() => {
      setSaveMessage(false);
    }, 2000);
  };

  return (
    <div class="w-full">
      <h1 class="text-lg font-semibold m-0 mb-4 text-black">
        LinkedIn Message Template
      </h1>

      <WildcardsPanel onInsert={handleInsertWildcard} />

      <TemplateEditor
        title={currentWork.title}
        template={currentWork.template}
        onTitleChange={handleTitleChange}
        onTemplateChange={handleTemplateChange}
        onGenerateTitle={handleGenerateTitle}
      />

      <div class="flex gap-2 mb-4">
        <button onClick={handleNew} class="btn-secondary flex-1" type="button">
          New
        </button>
        <button
          onClick={handleSave}
          class="btn-primary flex-1"
          onKeyDown={handleKeyDown}
          type="button"
        >
          Save
        </button>
        <button
          onClick={handleSaveAsNew}
          class="btn-secondary flex-1"
          type="button"
        >
          Save As
        </button>
      </div>

      {saveMessage && (
        <div class="text-center text-[#057642] text-xs mb-4 opacity-100 transition-opacity">
          Template saved!
        </div>
      )}

      <TemplatesList
        templates={savedTemplates}
        currentWork={currentWork}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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

      <div class="text-center text-xs text-[#666] mt-4 pt-4 border-t border-[#eee]">
        On any LinkedIn profile, press <kbd class="bg-[#f3f6f8] px-1.5 py-0.5 rounded text-xs border border-[#ddd]">Opt+V</kbd> to copy your personalized message
      </div>
    </div>
  );
};
