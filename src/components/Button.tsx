import { ComponentChildren } from 'preact';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

export const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  class: className = '',
  flex = 1
}: {
  children: ComponentChildren;
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  class?: string;
  flex?: 0 | 1
}) => {
  const baseClasses = `flex-${flex} px-4 py-3 rounded-[10px] font-semibold text-sm transition-colors`;

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-[#0073b1] text-white hover:bg-[#005885] disabled:opacity-40 disabled:cursor-not-allowed',
    secondary: 'bg-[#f3f6f8] text-black border border-[#ddd] hover:bg-[#e8f4f8] hover:border-[#0073b1]',
    danger: 'bg-[#f3f6f8] text-[#cc1016] border border-[#ddd] hover:bg-[#fee] hover:border-[#cc1016]'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button type={type} class={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};
