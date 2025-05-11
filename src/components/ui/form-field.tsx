import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function FormField({
  label,
  error,
  children,
  required = false,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-secondary-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}