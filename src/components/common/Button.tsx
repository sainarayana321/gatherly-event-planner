import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  const variantStyles = {
    primary:
      'bg-forest-700 hover:bg-forest-800 text-cream-50 shadow-sm border border-forest-800',
    secondary:
      'bg-cream-200 hover:bg-cream-300 text-stone-dark border border-stone-border',
    outline:
      'bg-transparent hover:bg-forest-50 text-forest-800 border border-forest-300',
    ghost:
      'bg-transparent hover:bg-cream-200 text-stone-dark',
    danger:
      'bg-rose-500 hover:bg-rose-600 text-white shadow-sm border border-rose-600',
    gold:
      'bg-gold-500 hover:bg-gold-600 text-white shadow-sm border border-gold-600',
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  }[size];

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : null}
      {children}
    </button>
  );
};
