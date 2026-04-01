import { useRef, useEffect } from 'preact/hooks';

export const SaveAsDialog = ({
  isOpen,
  title,
  onTitleChange,
  onConfirm,
  onCancel
}: {
  isOpen: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        class="bg-white border border-[#ddd] rounded-lg p-5 min-w-[300px] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 class="m-0 mb-4 text-base text-black">Save as new template</h3>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
          placeholder="Template title"
          class="input-text mb-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onConfirm();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
        />
        <div class="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            class="btn-secondary min-w-[80px]"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            class="btn-primary min-w-[80px]"
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
