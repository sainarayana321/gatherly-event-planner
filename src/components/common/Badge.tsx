import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'rose' | 'gold' | 'neutral' | 'warning' | 'success';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    forest: 'bg-forest-50 text-forest-800 border-forest-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    gold: 'bg-gold-50 text-gold-700 border-gold-200',
    neutral: 'bg-cream-200 text-stone-dark border-stone-border',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles} ${sizeStyles} ${className}`}
    >
      {children}
    </span>
  );
};
