import { FC } from 'preact';
import { WILDCARDS } from '../types';

interface WildcardsPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  onInsert: (wildcard: string) => void;
}

export const WildcardsPanel: FC<WildcardsPanelProps> = ({
  collapsed,
  onToggle,
  onInsert
}) => {
  return (
    <div class="bg-[#f3f6f8] px-3 py-3 rounded-[10px] text-xs mb-4">
      <div
        class="flex items-center gap-2 cursor-pointer select-none"
        onClick={onToggle}
      >
        <button
          class={`bg-none border-none text-black text-xs p-0 w-4 h-4 leading-none transition-transform ${
            collapsed ? 'transform -rotate-90' : ''
          }`}
          type="button"
        >
          ▼
        </button>
        <div class="font-semibold text-black flex-1">Available Wildcards:</div>
      </div>

      <div
        class={`flex flex-wrap gap-1.5 max-h-[500px] overflow-hidden transition-all ${
          collapsed ? 'max-h-0 opacity-0 mt-0' : 'opacity-100 mt-2'
        }`}
      >
        {WILDCARDS.map((wildcard) => (
          <button
            key={wildcard}
            class="bg-white px-2 py-1 rounded border border-[#ddd] cursor-pointer font-mono text-xs hover:bg-[#f0f0f0]"
            onClick={() => onInsert(wildcard)}
            type="button"
          >
            {wildcard}
          </button>
        ))}
      </div>
    </div>
  );
};
