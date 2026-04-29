// Adapter that lets supabase-js persist its session in chrome.storage.local
// instead of localStorage (which isn't available in service workers and is
// not shared across extension surfaces).
export const chromeStorageAdapter = {
  getItem: (key: string): Promise<string | null> =>
    new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        const value = result[key];
        resolve(typeof value === 'string' ? value : null);
      });
    }),

  setItem: (key: string, value: string): Promise<void> =>
    new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    }),

  removeItem: (key: string): Promise<void> =>
    new Promise((resolve) => {
      chrome.storage.local.remove(key, () => resolve());
    })
};
