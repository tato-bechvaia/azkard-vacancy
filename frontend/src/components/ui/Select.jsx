import { forwardRef } from 'react';

const stateStyles = {
  default: 'border-border bg-surface-100 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15 focus:bg-surface-50',
  error:   'border-danger/40 bg-danger-50/30 focus:border-danger focus:ring-2 focus:ring-danger/15',
  disabled: 'border-border-subtle bg-surface-200 text-text-muted cursor-not-allowed opacity-60',
};

const Select = forwardRef(function Select({
  label,
  helperText,
  error,
  children,
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
      <select
        ref={ref}
        disabled={disabled}
        className={`w-full h-10 rounded-lg px-3 text-sm text-text-primary transition-all duration-150 outline-none appearance-none bg-[length:16px] bg-[right_10px_center] bg-no-repeat ${stateStyles[state]}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23606070' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        }}
        {...props}
      >
        {children}
      </select>
      {error && typeof error === 'string' && (
        <p className='text-[10px] text-danger mt-1'>{error}</p>
      )}
      {helperText && !error && (
        <p className='text-[10px] text-text-muted mt-1'>{helperText}</p>
      )}
    </div>
  );
});

export default Select;
