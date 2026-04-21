import { ComponentProps } from 'preact';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

export const Button = ({
  variant = 'primary',
  flex = 1,
  ...props
}: {
  variant?: ButtonVariant;
  flex?: 0 | 1
} & ComponentProps<'button'>) => {
  const baseClasses = `flex-${flex} px-4 py-3 rounded-[10px] font-semibold text-sm transition-colors`;

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed',
    secondary: 'bg text-black border border hover:bg-state-selected hover:border-primary',
    danger: 'bg text-state-danger border border hover:bg-state-dangerBg hover:border-state-danger'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${props.class}`;

  return (
    <button class={classes} {...props}>
      {props.children}
    </button>
  );
};
