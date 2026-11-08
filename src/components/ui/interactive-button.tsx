import React from 'react';
import { cn } from '../../lib/utils';

export interface InteractiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'luxury-gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  icon?: React.ReactNode;
}

export const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      glow = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
      md: 'px-4 py-2 text-xs font-bold rounded-xl gap-2',
      lg: 'px-6 py-3.5 text-sm font-extrabold rounded-2xl gap-2.5',
    }[size];

    const variantClasses = {
      primary:
        'bg-neutral-950 text-white hover:bg-neutral-800 active:scale-[0.98] border border-neutral-800 shadow-md',
      secondary:
        'bg-white text-neutral-800 hover:bg-neutral-50 active:scale-[0.98] border border-neutral-200/90 shadow-sm',
      'luxury-gold':
        'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] border border-amber-400/30 shadow-md',
      ghost:
        'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 active:scale-[0.98]',
      danger:
        'bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-[0.98] border border-rose-200',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none select-none',
          sizeClasses,
          variantClasses,
          glow && 'ring-2 ring-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </button>
    );
  }
);

InteractiveButton.displayName = 'InteractiveButton';
