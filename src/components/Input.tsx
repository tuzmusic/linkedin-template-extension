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
      class={`w-full px-3 py-2 border border-border rounded-[10px] text-sm transition-colors focus:outline-none focus:border-primary ${className}`}
      {...props}
    />
  );
};
