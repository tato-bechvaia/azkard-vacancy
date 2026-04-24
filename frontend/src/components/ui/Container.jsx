const maxWidths = {
  sm:   'max-w-3xl',   // 768px — narrow content
  md:   'max-w-4xl',   // 896px — medium content
  lg:   'max-w-5xl',   // 1024px — wide content
  xl:   'max-w-6xl',   // 1152px — full-width sections
};

export default function Container({
  size = 'xl',
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={`${maxWidths[size]} mx-auto px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
