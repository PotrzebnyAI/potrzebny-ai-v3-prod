import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'border border-input bg-background text-foreground',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

// Dot Badge (for notifications)
interface DotBadgeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function DotBadge({
  count = 0,
  max = 99,
  showZero = false,
  children,
  className,
}: DotBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;
  const showBadge = showZero || count > 0;

  return (
    <div className={cn('relative inline-flex', className)}>
      {children}
      {showBadge && (
        <span
          className={cn(
            'absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground',
            count > 0 ? 'min-w-[18px] h-[18px] px-1 text-xs' : 'w-2.5 h-2.5'
          )}
        >
          {count > 0 && displayCount}
        </span>
      )}
    </div>
  );
}

// Status Badge
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
  label?: string;
  className?: string;
}

const statusConfig = {
  active: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'Aktywny' },
  inactive: { dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-700', label: 'Nieaktywny' },
  pending: { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Oczekuje' },
  error: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'Błąd' },
  success: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'Sukces' },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {label || config.label}
    </span>
  );
}
