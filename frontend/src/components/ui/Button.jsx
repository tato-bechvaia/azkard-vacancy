const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:opacity-40 disabled:cursor-not-allowed';

const variants = {
  primary:   'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white',
  secondary: 'bg-surface-200 hover:bg-surface-300 active:bg-surface-400 text-text-primary border border-border',
  ghost:     'bg-transparent hover:bg-surface-100 active:bg-surface-200 text-text-secondary',
  danger:    'bg-danger-50 hover:bg-danger/20 text-danger border border-danger/20',
  link:      'bg-transparent text-brand-400 hover:text-brand-300 underline-offset-2 hover:underline p-0 h-auto',
};

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-5 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
};

const iconOnlySizes = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-lg',
  lg: 'h-12 w-12 rounded-xl',
};

function Spinner({ className = '' }) {
  return (
    <svg className={`animate-spin h-4 w-4 ${className}`} viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-20' />
      <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
    </svg>
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconOnly = false,
  leadingIcon,
  trailingIcon,
  children,
  className = '',
  ...props
}) {
  const sizeClass = iconOnly ? iconOnlySizes[size] : sizes[size];

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {leadingIcon && <span className='flex-shrink-0'>{leadingIcon}</span>}
          {!iconOnly && children}
          {trailingIcon && <span className='flex-shrink-0'>{trailingIcon}</span>}
        </>
      )}
    </button>
  );
}
