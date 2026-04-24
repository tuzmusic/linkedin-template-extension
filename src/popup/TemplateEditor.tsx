import { MAX_CHAR_LIMIT } from '../types';
import { Input } from '../components/Input';

export const TemplateEditor = ({
  title,
  template,
  onTitleChange,
  onTemplateChange,
  onGenerateTitle
}: {
  title: string;
  template: string;
  onTitleChange: (title: string) => void;
  onTemplateChange: (template: string) => void;
  onGenerateTitle: () => void;
}) => {
  const placeholderText = 'Hi {{firstName}}, I noticed you work at {{companyName}}.';
  const totalCount = template.length;
  const withoutPlaceholders = template.replace(/\{\{[^}]+\}\}/g, '');
  const withoutPlaceholdersCount = withoutPlaceholders.length;

  const isOverLimit = withoutPlaceholdersCount > MAX_CHAR_LIMIT;
  const isWarning = totalCount > MAX_CHAR_LIMIT && !isOverLimit;

  const acceptPlaceHolderOnTabPress = (e: KeyboardEvent) => {
    if (e.key === 'Tab' && template.trim() === '') {
      e.preventDefault();
      onTemplateChange(placeholderText.slice(0, -1));
    }
  };

  return (
    <>
      <div class="mb-5">
        <label class="block text-xs font-medium mb-2 text-text-secondary">
          Template Title:
        </label>
        <div class="flex gap-2 items-stretch">
          <Input
            value={title}
            onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
            placeholder="e.g., Designer outreach, Recruiter intro..."
            class="flex-1"
          />
          <button
            onClick={onGenerateTitle}
            class="w-11 h-11 p-0 flex items-center justify-center bg-bg text-black border border-border rounded-[10px] font-normal text-lg transition-colors hover:bg-state-selected hover:border-primary"
            title="Generate title"
            type="button"
          >
            ✨
          </button>
        </div>
      </div>

      <div class="mb-5">
        <label class="block text-xs font-medium mb-2 text-text-secondary">
          Your Message Template:
        </label>
        <textarea
          value={template}
          onInput={(e) => onTemplateChange(e.currentTarget.value)}
          onKeyDown={acceptPlaceHolderOnTabPress}
          placeholder="Hi {{firstName}}, I noticed you work at {{companyName}}..."
          class="w-full px-3 py-2 border border-border rounded-[10px] text-sm resize-y box-border transition-colors focus:outline-none focus:border-primary min-h-[100px]"
        />
        <div
          class={`text-right text-xs mt-1 ${
            isOverLimit ? 'text-state-danger font-semibold' : isWarning ? 'text-state-warning font-semibold' : 'text-text-secondary'
          }`}
        >
          {totalCount}/300 ({withoutPlaceholdersCount} without placeholders)
        </div>
      </div>
    </>
  );
};
