export default function JobSection({ title, children }) {
  if (!children) return null;
  if (typeof children === 'string' && !children.trim()) return null;

  return (
    <div className='mb-10'>
      <h2 className='font-display font-semibold text-lg text-text-primary mb-4 pb-3 border-b border-border-subtle tracking-tight'>
        {title}
      </h2>
      <div className='text-sm text-text-secondary leading-[1.9] whitespace-pre-line'>
        {children}
      </div>
    </div>
  );
}
