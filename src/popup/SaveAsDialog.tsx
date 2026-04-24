import { useEffect, useRef } from 'preact/hooks';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

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
        class="bg-white border border-border rounded-lg p-5 min-w-[300px] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 class="m-0 mb-4 text-base text-black">Save as new template</h3>
        <Input
          ref={inputRef}
          value={title}
          onInput={(e) => onTitleChange((e.target as HTMLInputElement).value)}
          placeholder="Template title"
          class="mb-4"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onConfirm();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
        />
        <div class="flex gap-2 justify-end">
          <Button
            onClick={onCancel}
            variant="secondary"
            flex={0}
            class="min-w-20"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="primary"
            flex={0}
            class="min-w-20"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
