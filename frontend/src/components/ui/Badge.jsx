const variants = {
  default: 'bg-surface-200 text-text-secondary border-border',
  success: 'bg-success-50 text-success border-success/20',
  warning: 'bg-warning-50 text-warning border-warning/20',
  danger:  'bg-danger-50 text-danger border-danger/20',
  info:    'bg-info-50 text-info border-info/20',
  brand:   'bg-brand-600/10 text-brand-400 border-brand-400/20',
  premium: 'bg-premium-50 text-premium border-premium/20',
};

const sizes = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
};

export default function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  className = '',
  ...props
}) {
  const dotColors = {
    default: 'bg-text-muted',
    success: 'bg-success',
    warning: 'bg-warning',
    danger:  'bg-danger',
    info:    'bg-info',
    brand:   'bg-brand-400',
    premium: 'bg-premium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border tracking-wide ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
