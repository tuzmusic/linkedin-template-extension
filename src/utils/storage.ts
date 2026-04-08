import { CurrentWork, Template } from '../types';

export type AppStorageState = {
  savedTemplates: Template[];
  currentWork: CurrentWork;
  wildcardsCollapsed: boolean;
  messageTemplate: string;
};

export async function loadData(): Promise<{
  savedTemplates: Template[];
  currentWork: CurrentWork | null;
  wildcardsCollapsed: boolean;
}> {
  return new Promise((resolve) => {
    chrome.storage.sync.get<AppStorageState>(
      ['savedTemplates', 'currentWork', 'wildcardsCollapsed'],
      (result) => {
        const savedTemplates = result.savedTemplates || [];
        let currentWork = result.currentWork || null;

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

        resolve({
          savedTemplates,
          currentWork,
          wildcardsCollapsed: result.wildcardsCollapsed ?? true
        });
      }
    );
  });
}

export function saveData(data: Partial<AppStorageState>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, () => {
      resolve();
    });
  });
}
