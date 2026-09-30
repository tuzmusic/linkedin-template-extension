import { CurrentWork, DEFAULT_CHAR_LIMIT, Template } from '../types';
import { supabase } from './supabase-client';

export type AppStorageState = {
  savedTemplates: Template[];
  currentWork: CurrentWork;
  wildcardsCollapsed: boolean;
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
        // Templates cached before char_limit existed default to 300
        const savedTemplates = (result.savedTemplates || []).map((t) => ({
          ...t,
          char_limit: t.char_limit === undefined ? DEFAULT_CHAR_LIMIT : t.char_limit
        }));
        let currentWork = result.currentWork
          ? { ...result.currentWork, char_limit: result.currentWork.char_limit === undefined ? DEFAULT_CHAR_LIMIT : result.currentWork.char_limit }
          : null;

        // If no currentWork but we have templates, load first one
        if (!currentWork && savedTemplates.length > 0) {
          const firstTemplate = savedTemplates[0];
          currentWork = {
            id: firstTemplate.id,
            title: firstTemplate.title,
            template: firstTemplate.template,
            char_limit: firstTemplate.char_limit
          };
        }

        // If still no currentWork, initialize empty
        if (!currentWork) {
          currentWork = {
            id: null,
            title: '',
            template: '',
            char_limit: DEFAULT_CHAR_LIMIT
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

export async function fetchTemplatesFromDb(): Promise<Template[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return [];

  const { data, error } = await supabase
    .from('templates')
    .select('id, title, content, char_limit, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    template: row.content,
    char_limit: row.char_limit,
    created_at: row.created_at,
    updated_at: row.updated_at
  }));
}

export async function createTemplateInDb(title: string, content: string, charLimit: number | null): Promise<Template | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('templates')
    .insert({ user_id: user.id, title, content, char_limit: charLimit })
    .select('id, title, content, char_limit')
    .single();

  if (error || !data) return null;
  return { id: data.id, title: data.title, template: data.content, char_limit: data.char_limit };
}

export async function updateTemplateInDb(id: string, title: string, content: string, charLimit: number | null): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from('templates').upsert({
    id,
    user_id: user.id,
    title,
    content,
    char_limit: charLimit
  }, { onConflict: 'id' });
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
