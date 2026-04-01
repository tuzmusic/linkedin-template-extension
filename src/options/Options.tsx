import { FC } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { WILDCARDS, MAX_CHAR_LIMIT } from '../types';

const WILDCARD_DESCRIPTIONS: Record<string, string> = {
  '{{firstName}}': "Contact's first name",
  '{{lastName}}': "Contact's last name",
  '{{fullName}}': "Contact's full name",
  '{{companyName}}': 'Current company name',
  '{{position}}': 'Current job position',
  '{{headline}}': 'LinkedIn headline',
  '{{location}}': 'Location',
  '{{msgFirstName}}': "Message recipient's first name",
  '{{msgLastName}}': "Message recipient's last name",
  '{{msgFullName}}': "Message recipient's full name"
};

export const Options: FC = () => {
  const [template, setTemplate] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load template on mount
  useEffect(() => {
    chrome.storage.sync.get(['messageTemplate'], (result) => {
      if (result.messageTemplate) {
        setTemplate(result.messageTemplate);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set({ messageTemplate: template }, () => {
      setShowSaved(true);
      setTimeout(() => {
        setShowSaved(false);
      }, 2000);
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  const charCount = template.length;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;

  return (
    <div class="max-w-2xl mx-auto my-10 px-5">
      <h1 class="text-3xl font-semibold mb-2 text-black">
        LinkedIn Message Template Settings
      </h1>
      <p class="text-[#666] mb-8">Customize your connection request message template</p>

      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 class="text-lg font-semibold mb-4 text-black">Available Wildcards</h2>
        <div class="bg-[#f3f6f8] p-4 rounded-[10px]">
          <div class="font-semibold mb-3 text-black text-sm">
            Use these placeholders in your template:
          </div>
          {WILDCARDS.map((wildcard) => (
            <div key={wildcard} class="flex items-center mb-2">
              <code class="bg-white px-2 py-1 rounded border border-[#ddd] font-mono text-xs min-w-[140px] mr-3">
                {wildcard}
              </code>
              <span class="text-[#666] text-xs">
                {WILDCARD_DESCRIPTIONS[wildcard] || wildcard}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-lg font-semibold mb-4 text-black">Message Template</h2>
        <label class="block text-sm font-medium mb-2 text-[#666]">
          Your Template (max {MAX_CHAR_LIMIT} characters):
        </label>
        <textarea
          ref={textareaRef}
          value={template}
          onInput={(e) => setTemplate((e.target as HTMLTextAreaElement).value)}
          onKeyDown={handleKeyDown}
          placeholder="Hi {{firstName}}, I noticed you work at {{companyName}}. I'd love to connect and learn more about your work!"
          class="w-full min-h-[120px] px-3 py-2 border border-[#ddd] rounded-[10px] font-inherit text-sm resize-vertical box-border focus:outline-none focus:border-[#0073b1]"
        />
        <div
          class={`text-right text-xs mt-1 ${
            isOverLimit ? 'text-[#cc1016] font-semibold' : 'text-[#666]'
          }`}
        >
          {charCount}/{MAX_CHAR_LIMIT} characters
        </div>

        <div class="mt-4">
          <button
            onClick={handleSave}
            class="px-6 py-3 bg-[#0073b1] text-white rounded-[10px] text-sm font-semibold cursor-pointer transition-colors hover:bg-[#005885]"
            type="button"
          >
            Save Template
          </button>
          {showSaved && (
            <span class="ml-4 text-[#057642] text-sm inline-block">
              Saved successfully!
            </span>
          )}
        </div>

        <div class="bg-[#e7f3ff] border border-[#b3d9ff] rounded-[10px] p-4 mt-4">
          <strong class="block mb-2 text-[#0073b1]">How to use:</strong>
          <p class="m-0 text-xs text-[#333] leading-relaxed">
            Navigate to any LinkedIn profile page and press{' '}
            <kbd class="bg-[#f3f6f8] px-2 py-1 rounded text-xs border border-[#ddd]">
              Cmd+.
            </kbd>{' '}
            (or{' '}
            <kbd class="bg-[#f3f6f8] px-2 py-1 rounded text-xs border border-[#ddd]">
              Ctrl+.
            </kbd>{' '}
            on Windows/Linux). The extension will automatically fill in the wildcards
            with the person's information and copy the message to your clipboard. Then
            simply paste it into LinkedIn's connection request message box!
          </p>
        </div>
      </div>
    </div>
  );
};
