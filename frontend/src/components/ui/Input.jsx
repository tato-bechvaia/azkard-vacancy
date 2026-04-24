import { forwardRef } from 'react';

const stateStyles = {
  default: 'border-border bg-surface-100 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15 focus:bg-surface-50',
  error:   'border-danger/40 bg-danger-50/30 focus:border-danger focus:ring-2 focus:ring-danger/15',
  disabled: 'border-border-subtle bg-surface-200 text-text-muted cursor-not-allowed opacity-60',
};

const Input = forwardRef(function Input({
  label,
  helperText,
  error,
  leadingIcon,
  trailingIcon,
  className = '',
  disabled = false,
  ...props
}, ref) {
  const state = disabled ? 'disabled' : error ? 'error' : 'default';

  return (
    <div className={className}>
      {label && (
        <label className='block text-xs font-medium text-text-secondary mb-1.5'>
          {label}
        </label>
      )}
      <div className='relative'>
        {leadingIcon && (
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none'>
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={`w-full h-10 rounded-lg px-3 text-sm text-text-primary placeholder-text-muted transition-all duration-150 outline-none ${stateStyles[state]} ${leadingIcon ? 'pl-9' : ''} ${trailingIcon ? 'pr-9' : ''}`}
          {...props}
        />
        {trailingIcon && (
          <span className='absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none'>
            {trailingIcon}
          </span>
        )}
      </div>
      {error && typeof error === 'string' && (
        <p className='text-[10px] text-danger mt-1'>{error}</p>
      )}
      {helperText && !error && (
        <p className='text-[10px] text-text-muted mt-1'>{helperText}</p>
      )}
    </div>
  );
});

export default Input;

export const Textarea = forwardRef(function Textarea({
  label,
  helperText,
  error,
  className = '',
  disabled = false,
  rows = 4,
  ...props
}, ref) {
  const state = disabled ? 'disabled' : error ? 'error' : 'default';

  return (
    <div className={className}>
      {label && (
        <label className='block text-xs font-medium text-text-secondary mb-1.5'>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        disabled={disabled}
        rows={rows}
        className={`w-full rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted transition-all duration-150 outline-none resize-none ${stateStyles[state]}`}
        {...props}
      />
      {error && typeof error === 'string' && (
        <p className='text-[10px] text-danger mt-1'>{error}</p>
      )}
      {helperText && !error && (
        <p className='text-[10px] text-text-muted mt-1'>{helperText}</p>
      )}
    </div>
  );
});
