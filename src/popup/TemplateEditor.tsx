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
          <Input
            value={title}
            onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
            placeholder="e.g., Designer outreach, Recruiter intro..."
            class="flex-1"
          />
          <button
            onClick={onGenerateTitle}
            class="w-11 h-11 p-0 flex items-center justify-center bg-[#f3f6f8] text-black border border-[#ddd] rounded-[10px] font-normal text-lg transition-colors hover:bg-[#e8f4f8] hover:border-[#0073b1]"
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
