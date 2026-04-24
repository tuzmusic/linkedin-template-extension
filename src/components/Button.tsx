import { ComponentChildren, JSX } from 'preact';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

export const Button = ({
  children,
  variant = 'primary',
  class: className = '',
  flex = 1,
  ...props
}: {
  children: ComponentChildren;
  variant?: ButtonVariant;
  class?: string;
  flex?: 0 | 1
} & JSX.IntrinsicElements['button']) => {
  const baseClasses = `flex-${flex} px-4 py-3 rounded-[10px] font-semibold text-sm transition-colors`;

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed',
    secondary: 'bg-bg text-black border border-border hover:bg-state-selected hover:border-primary',
    danger: 'bg-bg text-state-danger border border-border hover:bg-state-dangerBg hover:border-state-danger'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button class={classes} {...props}>
      {children}
    </button>
  );
};
