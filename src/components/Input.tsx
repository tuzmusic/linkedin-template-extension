import { JSX } from 'preact'

export const Input = ({
  ref,
  class: className = '',
  ...props
}: {
  ref?: any;
  class?: string;
} & JSX.IntrinsicElements['input']) => {
  return (
    <input
      ref={ref}
      class={`w-full px-3 py-2 border border-[#ddd] rounded-[10px] text-sm transition-colors focus:outline-none focus:border-[#0073b1] ${className}`}
      {...props}
    />
  );
};
