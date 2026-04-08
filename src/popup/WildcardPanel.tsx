import { useEffect, useState } from 'preact/hooks';
import { WILDCARDS } from '../types';
import { saveData } from '../utils/storage';

function WildcardButton({ onClick, wildcard }: { onClick: () => void, wildcard: string }) {
  return <button
    class="bg-white px-2 py-1 rounded border border cursor-pointer font-mono text-xs hover:bg-bg-lighter"
    onClick={onClick}
    type="button"
  >
    {wildcard}
  </button>;
}

function Carat({ collapsed }: { collapsed: boolean }) {
  return <button
    class={`bg-none border-none text-black text-xs p-0 w-4 h-4 leading-none transition-transform ${
      collapsed ? "transform -rotate-90" : ""
    }`}
    type="button"
  >
    ▼
  </button>;
}

export const WildcardsPanel = ({ onInsert }: { onInsert: (wildcard: string) => void; }) => {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(function loadWildcardCollapsedStateOnMount() {
    chrome.storage.local.get('wildcardsCollapsed', (result: Record<string, unknown>) => {
      if ('wildcardsCollapsed' in result) {
        setCollapsed(result.wildcardsCollapsed as boolean);
      }
    });
  }, []);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    saveData({ wildcardsCollapsed: newState });
  };

  return (
    <div class="bg px-3 py-3 rounded-[10px] text-xs mb-4 flex flex-col gap-2">
      <div
        class="flex items-center gap-2 cursor-pointer select-none"
        onClick={handleToggle}
      >
        <Carat collapsed={collapsed}/>
        <div class="font-semibold text-black flex-1">Available Wildcards:</div>
      </div>
      {!collapsed &&
        <ul className={`flex flex-wrap gap-1.5 max-h-[500px] overflow-hidden`}>
          {WILDCARDS.map((wildcard) => (
            <li key={wildcard}>
              <WildcardButton onClick={() => onInsert(wildcard)} wildcard={wildcard}/>
            </li>
          ))}
        </ul>}
    </div>
  );
};
