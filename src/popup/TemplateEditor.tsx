import { MAX_CHAR_LIMIT } from '../types';

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
  const totalCount = template.length;
  const withoutPlaceholders = template.replace(/\{\{[^}]+\}\}/g, '');
  const withoutPlaceholdersCount = withoutPlaceholders.length;

  const isOverLimit = withoutPlaceholdersCount > MAX_CHAR_LIMIT;
  const isWarning = totalCount > MAX_CHAR_LIMIT && !isOverLimit;

  return (
    <>
      <div class="mb-5">
        <label class="block text-xs font-medium mb-2 text-[#666]">
          Template Title:
        </label>
        <div class="flex gap-2 items-stretch">
          <input
            type="text"
            value={title}
            onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
            placeholder="e.g., Designer outreach, Recruiter intro..."
            class="input-text flex-1"
          />
          <button
            onClick={onGenerateTitle}
            class="btn-icon"
            title="Generate title"
            type="button"
          >
            ✨
          </button>
        </div>
      </div>

      <div class="mb-5">
        <label class="block text-xs font-medium mb-2 text-[#666]">
          Your Message Template:
        </label>
        <textarea
          value={template}
          onInput={(e) => onTemplateChange((e.target as HTMLTextAreaElement).value)}
          placeholder="Hi {{firstName}}, I noticed you work at {{companyName}}..."
          class="textarea-base min-h-[100px]"
        />
        <div
          class={`text-right text-xs mt-1 ${
            isOverLimit ? 'text-[#cc1016] font-semibold' : isWarning ? 'text-[#ff8c00] font-semibold' : 'text-[#666]'
          }`}
        >
          {totalCount}/300 ({withoutPlaceholdersCount} without placeholders)
        </div>
      </div>
    </>
  );
};
