import { useRef } from 'preact/hooks';
import { CurrentWork, SortConfig, Template } from '../types';
import type { SortDir, SortField } from '../types';
import { Input } from '../components/Input';

const SORT_OPTIONS: { value: string; label: string; field: SortField; dir: SortDir }[] = [
  { value: 'created_at_desc', label: 'Created (newest)', field: 'created_at', dir: 'desc' },
  { value: 'created_at_asc',  label: 'Created (oldest)', field: 'created_at', dir: 'asc'  },
  { value: 'updated_at_desc', label: 'Updated (newest)', field: 'updated_at', dir: 'desc' },
  { value: 'updated_at_asc',  label: 'Updated (oldest)', field: 'updated_at', dir: 'asc'  },
  { value: 'title_asc',       label: 'Name (A → Z)',     field: 'title',      dir: 'asc'  },
  { value: 'title_desc',      label: 'Name (Z → A)',     field: 'title',      dir: 'desc' },
];

export const TemplatesList = ({
  templates,
  currentWork,
  searchQuery,
  onSearchChange,
  sortConfig,
  onSortChange,
  onSelect,
  onDelete
}: {
  templates: Template[];
  currentWork: CurrentWork;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  onSelect: (template: Template) => void;
  onDelete: (id: string) => void;
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sortedTemplates = sortTemplates(templates, sortConfig);
  const filteredItems = getFilteredItems(sortedTemplates, currentWork, searchQuery);

  const currentValue = `${sortConfig.field}_${sortConfig.dir}`;

  const handleSortChange = (value: string) => {
    const option = SORT_OPTIONS.find((o) => o.value === value);
    if (option) onSortChange({ field: option.field, dir: option.dir });
  };

  return (
    <div class="mb-5">
      <div class="flex items-center justify-between mb-2">
        <label class="block text-xs font-medium text-text-secondary">
          Templates:
        </label>
        <select
          value={currentValue}
          onChange={(e) => handleSortChange((e.target as HTMLSelectElement).value)}
          class="text-[10px] text-text-secondary border border-border rounded px-1.5 py-0.5 bg-white cursor-pointer focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div class="border border-border rounded-[10px] overflow-hidden">
        <div class="border-b border-border shrink-0 flex items-center px-3 py-2">
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
                class={`px-3 py-2.5 border-b border-bg-lighter text-xs hover:bg-bg cursor-pointer flex items-center gap-2 transition-colors last:border-b-0 ${
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
                    class="bg-none border-none text-state-danger font-semibold text-base p-1 opacity-0 hover:bg-state-dangerBg hover:rounded transition-all"
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

function sortTemplates(templates: Template[], config: SortConfig): Template[] {
  return [...templates].sort((a, b) => {
    let cmp = 0;
    if (config.field === 'title') {
      cmp = a.title.localeCompare(b.title);
    } else {
      const aVal = a[config.field] ?? '';
      const bVal = b[config.field] ?? '';
      cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    }
    return config.dir === 'asc' ? cmp : -cmp;
  });
}

function getFilteredItems(
  templates: Template[],
  currentWork: CurrentWork,
  searchQuery: string
): FilteredItem[] {
  const isDraft = currentWork.id === null;
  const isEdited = hasUnsavedChanges(templates, currentWork) && !isDraft;

  const items: FilteredItem[] = [];

  // Draft/edited always at top, unsorted
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

  templates.forEach((template) => {
    if (isEdited && template.id === currentWork.id) return;

    items.push({
      id: template.id,
      template,
      displayTitle: template.title,
      selected: !isEdited && template.id === currentWork.id,
      status: null
    });
  });

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      return (
        item.displayTitle.toLowerCase().includes(query) ||
        item.template.template.toLowerCase().includes(query)
      );
    });
  }

  return items;
}

function hasUnsavedChanges(templates: Template[], currentWork: CurrentWork): boolean {
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
