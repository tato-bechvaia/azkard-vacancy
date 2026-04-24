export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`bg-surface-50 border border-border-subtle rounded-xl text-center py-16 px-8 ${className}`}>
      {icon && (
        <div className='w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center mx-auto mb-4'>
          {icon}
        </div>
      )}
      {title && (
        <p className='font-medium text-sm text-text-secondary mb-1.5'>{title}</p>
      )}
      {description && (
        <p className='text-xs text-text-muted mb-5'>{description}</p>
      )}
      {action}
    </div>
  );
}
