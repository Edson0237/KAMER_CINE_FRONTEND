import * as React from 'react';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-kct-gold focus:ring-1 focus:ring-kct-gold outline-none disabled:opacity-50';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldBase, 'h-10', className)} {...props} />,
);
Input.displayName = 'Input';

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(fieldBase, 'h-10', className)} {...props} />,
);
Select.displayName = 'Select';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(fieldBase, 'min-h-[88px]', className)} {...props} />,
);
Textarea.displayName = 'Textarea';

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}

/** Libellé + champ + aide/erreur — un seul style de formulaire pour toute l'application. */
function FormField({ label, required, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
        {required && <span className="text-kct-red"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-[11px] text-kct-red">{error}</p>}
    </div>
  );
}

export { Input, Select, Textarea, FormField };
