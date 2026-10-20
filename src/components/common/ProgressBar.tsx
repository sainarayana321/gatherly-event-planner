import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  variant?: 'forest' | 'rose' | 'gold';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  sublabel,
  variant = 'forest',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));

  const fillColors = {
    forest: 'bg-forest-600',
    rose: 'bg-rose-500',
    gold: 'bg-gold-500',
  }[variant];

  return (
    <div className={`w-full ${className}`}>
      {(label || sublabel) && (
        <div className="flex justify-between items-center text-xs text-stone-muted mb-1.5 font-medium">
          {label && <span>{label}</span>}
          {sublabel && <span className="font-semibold text-stone-dark">{sublabel}</span>}
        </div>
      )}
      <div
        className="h-2 w-full bg-cream-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(clampedValue)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full ${fillColors} transition-all duration-500 rounded-full`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
