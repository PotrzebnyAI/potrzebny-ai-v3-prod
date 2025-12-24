'use client';

import * as React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, indeterminate, className, id, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const checkboxId = id || React.useId();

    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex items-center h-5">
          <div className="relative">
            <input
              ref={inputRef}
              type="checkbox"
              id={checkboxId}
              className="sr-only peer"
              {...props}
            />
            <div
              className={cn(
                'h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
                'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                'peer-checked:bg-primary peer-checked:text-primary-foreground',
                'flex items-center justify-center',
                error && 'border-destructive'
              )}
            >
              {props.checked && !indeterminate && (
                <Check className="h-3 w-3 text-current" />
              )}
              {indeterminate && (
                <Minus className="h-3 w-3 text-current" />
              )}
            </div>
          </div>
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'font-medium text-foreground cursor-pointer',
                  props.disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
            {error && <p className="text-destructive mt-1">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Checkbox Group
interface CheckboxGroupProps {
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  error?: string;
}

export function CheckboxGroup({ options, value, onChange, className, error }: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {options.map((option) => (
        <Checkbox
          key={option.value}
          checked={value.includes(option.value)}
          onChange={(e) => handleChange(option.value, e.target.checked)}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
        />
      ))}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
