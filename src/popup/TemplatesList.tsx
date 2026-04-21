import { useRef } from 'preact/hooks';
import { CurrentWork, Template } from '../types';
import { Input } from '../components/Input';

export const TemplatesList = ({
  templates,
  currentWork,
  searchQuery,
  onSearchChange,
  onSelect,
  onDelete
}: {
  templates: Template[];
  currentWork: CurrentWork;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelect: (template: Template) => void;
  onDelete: (id: string) => void;
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = getFilteredItems(templates, currentWork, searchQuery);

  return (
    <div class="mb-5">
      <label class="block text-xs font-medium mb-2 text-text-secondary">
        Recent Templates:
      </label>
      <div class="border border rounded-[10px] overflow-hidden">
        <div class="border-b border shrink-0 flex items-center px-3 py-2">
          <svg
            class="w-4 h-4 text-text-placeholder shrink-0 mr-2 pointer-events-none"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M6.5 1a5.5 5.5 0 014.384 8.884l4.3 4.3a.75.75 0 11-1.06 1.06l-4.3-4.3A5.5 5.5 0 116.5 1zm0 1.5a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
            placeholder="Search by name or content..."
            class="border-none rounded-none flex-1 focus:ring-0 focus:border-none focus:shadow-none p-0 text-xs ml-2"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                searchInputRef.current?.focus();
              }}
              class="bg-none border-none text-text-secondary font-semibold text-lg p-1 ml-1 hover:text-text-primary cursor-pointer"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        <div class="max-h-[150px] overflow-y-auto bg-white">
          {filteredItems.length === 0 ? (
            <div class="px-3 py-3 text-center text-text-placeholder text-xs bg-bg-light border-t border-bg-lighter">
              No templates match your search.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                class={`px-3 py-2.5 border-b border-bg-lighter text-xs hover:bg group cursor-pointer flex items-center gap-2 transition-colors last:border-b-0 ${
                  item.selected ? 'bg-state-selected font-medium' : ''
                } ${item.status ? 'italic text-text-secondary' : ''}`}
                onClick={() => !item.selected && onSelect(item.template)}
              >
                <span class="flex-1">{item.displayTitle}</span>
                {item.template.id && !item.status && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.template.id);
                    }}
                    class="bg-none border-none text-state-danger font-semibold text-base p-1 opacity-0 group-hover:opacity-100 hover:bg-state-dangerBg hover:rounded transition-all"
                    title="Delete template"
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface FilteredItem {
  id: string;
  template: Template;
  displayTitle: string;
  selected: boolean;
  status: 'draft' | 'edited' | null;
}

function getFilteredItems(
  templates: Template[],
  currentWork: CurrentWork,
  searchQuery: string
): FilteredItem[] {
  const isDraft = currentWork.id === null;
  const isEdited = hasUnsavedChanges(templates, currentWork) && !isDraft;

  const items: FilteredItem[] = [];

  // Show draft/edited at top if applicable
  if (isDraft || isEdited) {
    const statusText = isDraft ? '(draft)' : '(edited)';
    const displayTitle = currentWork.title
      ? `${currentWork.title} ${statusText}`
      : statusText;

    items.push({
      id: currentWork.id || 'draft',
      template: {
        id: currentWork.id || '',
        title: currentWork.title,
        template: currentWork.template
      },
      displayTitle,
      selected: true,
      status: isDraft ? 'draft' : 'edited'
    });
  }

  // Show all saved templates
  templates.forEach((template) => {
    // Skip if this is the current work (already shown above as edited)
    if (isEdited && template.id === currentWork.id) {
      return;
    }

    const isCurrentTemplate = !isEdited && template.id === currentWork.id;

    items.push({
      id: template.id,
      template,
      displayTitle: template.title,
      selected: isCurrentTemplate,
      status: null
    });
  });

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const titleMatch = item.displayTitle.toLowerCase().includes(query);
      const contentMatch = item.template.template.toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  }

  return items;
}

function hasUnsavedChanges(
  templates: Template[],
  currentWork: CurrentWork
): boolean {
  if (currentWork.id === null) {
    return currentWork.title.trim() !== '' || currentWork.template.trim() !== '';
  }

  const savedVersion = templates.find((t) => t.id === currentWork.id);
  if (!savedVersion) return false;

  return (
    savedVersion.title !== currentWork.title ||
    savedVersion.template !== currentWork.template
  );
}
