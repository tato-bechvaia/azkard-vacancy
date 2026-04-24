const variants = {
  default:  'bg-surface-200 text-text-secondary border-border-subtle',
  brand:    'bg-brand-600/10 text-brand-400 border-brand-400/20',
  teal:     'bg-teal-500/10 text-teal-400 border-teal-500/20',
  blue:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  violet:   'bg-violet-500/10 text-violet-400 border-violet-500/20',
  amber:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  green:    'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function Tag({
  variant = 'default',
  dot = false,
  dotColor,
  removable = false,
  onRemove,
  children,
  className = '',
  ...props
}) {
  const dotBg = dotColor || {
    default: 'bg-text-muted',
    brand:   'bg-brand-400',
    teal:    'bg-teal-400',
    blue:    'bg-blue-400',
    violet:  'bg-violet-400',
    amber:   'bg-amber-400',
    green:   'bg-green-400',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${variants[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotBg}`} />}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className='ml-0.5 text-current opacity-50 hover:opacity-100 transition-opacity'
        >
          <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
            <path d='M18 6 6 18M6 6l12 12' />
          </svg>
        </button>
      )}
    </span>
  );
}
