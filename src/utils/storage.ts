import { CurrentWork, MAX_CHAR_LIMIT, Template } from '../types';
import { supabase } from './supabase-client';

export type AppStorageState = {
  savedTemplates: Template[];
  currentWork: CurrentWork;
  wildcardsCollapsed: boolean;
  messageTemplate: string;
  charLimit: number;
  charLimitEnabled: boolean;
};

export async function loadData(): Promise<{
  savedTemplates: Template[];
  currentWork: CurrentWork | null;
  wildcardsCollapsed: boolean;
  charLimit: number;
  charLimitEnabled: boolean;
}> {
  return new Promise((resolve) => {
    chrome.storage.sync.get<AppStorageState>(
      ['savedTemplates', 'currentWork', 'wildcardsCollapsed', 'charLimit', 'charLimitEnabled'],
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
          wildcardsCollapsed: result.wildcardsCollapsed ?? true,
          charLimit: result.charLimit ?? MAX_CHAR_LIMIT,
          charLimitEnabled: result.charLimitEnabled ?? true
        });
      }
    );
  });
}

export async function fetchTemplatesFromDb(): Promise<Template[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('templates')
    .select('id, title, content')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    template: row.content
  }));
}

export async function createTemplateInDb(title: string, content: string): Promise<Template | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('templates')
    .insert({ user_id: user.id, title, content })
    .select('id, title, content')
    .single();

  if (error || !data) return null;
  return { id: data.id, title: data.title, template: data.content };
}

export async function updateTemplateInDb(id: string, title: string, content: string): Promise<boolean> {
  const { error } = await supabase.from('templates').update({ title, content }).eq('id', id);
  return !error;
}

export async function deleteTemplateFromDb(id: string): Promise<boolean> {
  const { error } = await supabase.from('templates').delete().eq('id', id);
  return !error;
}

export function saveData(data: Partial<AppStorageState>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, () => {
      resolve();
    });
  });
}
