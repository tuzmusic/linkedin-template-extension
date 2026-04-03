export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onInput,
  onKeyDown,
  ref,
  class: className = ''
}: {
  type?: string;
  placeholder?: string;
  value?: string;
  onInput?: (e: Event) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  ref?: any;
  class?: string;
}) => {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onInput={onInput}
      onKeyDown={onKeyDown}
      class={`w-full px-3 py-2 border border-[#ddd] rounded-[10px] text-sm transition-colors focus:outline-none focus:border-[#0073b1] ${className}`}
    />
  );
};
