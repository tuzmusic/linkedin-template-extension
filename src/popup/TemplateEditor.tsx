import { Input } from '../components/Input';

export const TemplateEditor = ({
  title,
  template,
  onTitleChange,
  onTemplateChange,
  onGenerateTitle,
  charLimit,
  charLimitEnabled,
  onCharLimitChange,
  onCharLimitEnabledChange
}: {
  title: string;
  template: string;
  onTitleChange: (title: string) => void;
  onTemplateChange: (template: string) => void;
  onGenerateTitle: () => void;
  charLimit: number;
  charLimitEnabled: boolean;
  onCharLimitChange: (value: number) => void;
  onCharLimitEnabledChange: (enabled: boolean) => void;
}) => {
  const placeholderText = 'Hi {{firstName}}, I noticed you work at {{companyName}}.';
  const totalCount = template.length;
  const withoutPlaceholders = template.replace(/\{\{[^}]+}}/g, '');
  const withoutPlaceholdersCount = withoutPlaceholders.length;

  const isOverLimit = charLimitEnabled && withoutPlaceholdersCount > charLimit;
  const isWarning = charLimitEnabled && totalCount > charLimit && !isOverLimit;

  const acceptPlaceHolderOnTabPress = (e: KeyboardEvent) => {
    if (e.key === 'Tab' && template.trim() === '') {
      e.preventDefault();
      onTemplateChange(placeholderText.slice(0, -1));
    }
  };

  function makeCharCountStr() {
    let str = `${totalCount}`
    if (charLimitEnabled) {
      str += `/${charLimit}`
    } else {
      str += ' chars'
    }

    return str + ` (${withoutPlaceholdersCount} without placeholders)`
  }

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
            class="w-11 h-11 p-0 flex items-center justify-center bg text-black border border rounded-[10px] font-normal text-lg transition-colors hover:bg-state-selected hover:border-primary"
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
          class="w-full px-3 py-2 border border rounded-[10px] text-sm resize-y box-border transition-colors focus:outline-none focus:border-primary min-h-[100px]"
        />
        <div class="flex items-center justify-between mt-1 gap-2">
          <div class="flex items-center gap-1.5">
            <input
              type="checkbox"
              id="charLimitEnabled"
              checked={charLimitEnabled}
              onChange={(e) => onCharLimitEnabledChange((e.target as HTMLInputElement).checked)}
              class="cursor-pointer"
            />
            <label for="charLimitEnabled" class="text-xs text-text-secondary cursor-pointer select-none">
              Limit:
            </label>
            <input
              type="number"
              value={charLimit}
              min={1}
              disabled={!charLimitEnabled}
              onInput={(e) => {
                const val = parseInt((e.target as HTMLInputElement).value, 10);
                if (!isNaN(val) && val > 0) onCharLimitChange(val);
              }}
              class="w-16 px-1.5 py-0.5 text-xs border border rounded-md text-center disabled:opacity-40 focus:outline-none focus:border-primary"
            />
          </div>
          <div
            class={`text-xs ${
              isOverLimit ? 'text-state-danger font-semibold' : isWarning ? 'text-state-warning font-semibold' : 'text-text-secondary'
            }`}
          >
            {makeCharCountStr()}
          </div>
        </div>
      </div>
    </>
  );
};
