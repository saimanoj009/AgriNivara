import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  successMessage?: string;
  required?: boolean;
  icon?: React.ReactNode;
  as?: 'input' | 'textarea' | 'select';
  options?: Array<{ label: string; value: string | number }>;
  rows?: number;
  containerClassName?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      name,
      id,
      error,
      hint,
      successMessage,
      required = false,
      icon,
      type = 'text',
      as = 'input',
      options = [],
      rows = 3,
      containerClassName = '',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `field-${name}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const hasError = Boolean(error);
    const hasSuccess = Boolean(successMessage && !hasError);

    const baseInputStyles = `
      w-full rounded-xl text-sm transition-all duration-200 outline-none
      bg-[#0c241e] text-[#f3ebdd] placeholder-[#738a7c]
      border ${
        hasError
          ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
          : hasSuccess
          ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
          : 'border-white/12 focus:border-[#00b884] focus:ring-2 focus:ring-[#00b884]/25 hover:border-white/20'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}
    `;

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-medium text-[#f3ebdd]/95 flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-rose-400" aria-hidden="true">*</span>}
          </label>

          {hint && (
            <span
              id={hintId}
              className="text-[11px] sm:text-xs text-[#a8b9ae]/80 font-normal"
            >
              {hint}
            </span>
          )}
        </div>

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-[#a8b9ae] pointer-events-none shrink-0">
              {icon}
            </div>
          )}

          {as === 'textarea' ? (
            <textarea
              id={inputId}
              name={name}
              rows={rows}
              required={required}
              disabled={disabled}
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : hint ? hintId : undefined}
              className={`${baseInputStyles} p-3 ${icon ? 'pl-10' : ''} ${className}`}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : as === 'select' ? (
            <select
              id={inputId}
              name={name}
              required={required}
              disabled={disabled}
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : hint ? hintId : undefined}
              className={`${baseInputStyles} py-2.5 px-3.5 ${icon ? 'pl-10' : ''} appearance-none cursor-pointer ${className}`}
              {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {options.map((opt) => (
                <option key={String(opt.value)} value={opt.value} className="bg-[#102d25] text-[#f3ebdd]">
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={ref}
              id={inputId}
              name={name}
              type={effectiveType}
              required={required}
              disabled={disabled}
              aria-invalid={hasError}
              aria-describedby={hasError ? errorId : hint ? hintId : undefined}
              className={`${baseInputStyles} py-2.5 px-3.5 ${icon ? 'pl-10' : ''} ${
                isPassword || hasError || hasSuccess ? 'pr-10' : ''
              } ${className}`}
              {...props}
            />
          )}

          {/* Password toggle button */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 p-1 text-[#a8b9ae] hover:text-[#f3ebdd] rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {/* Validation Status Indicator */}
          {!isPassword && hasError && (
            <div className="absolute right-3 pointer-events-none text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {!isPassword && hasSuccess && (
            <div className="absolute right-3 pointer-events-none text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-rose-400 font-medium flex items-center gap-1.5 mt-0.5 animate-in fade-in"
          >
            <span>{error}</span>
          </p>
        )}

        {/* Success message */}
        {hasSuccess && (
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5 animate-in fade-in">
            <span>{successMessage}</span>
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
