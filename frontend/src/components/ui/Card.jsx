const variants = {
  default:     'bg-surface-50 border border-border-subtle',
  elevated:    'bg-surface-elevated border border-border shadow-card-md',
  interactive: 'bg-surface-50 border border-border-subtle hover:border-border-strong hover:bg-surface-100 hover:shadow-card-md cursor-pointer transition-all duration-200',
  premium:     'bg-surface-50 border border-premium/20 shadow-glow-premium hover:border-premium/35 transition-all duration-300',
};

const paddings = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
  xl:   'p-8',
};

export default function Card({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
