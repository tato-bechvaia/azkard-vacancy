const sizes = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <svg className={`animate-spin ${sizes[size]} ${className}`} viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' className='opacity-20' />
      <path d='M4 12a8 8 0 018-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
    </svg>
  );
}

export function LoadingScreen({ text = 'იტვირთება...' }) {
  return (
    <div className='min-h-screen bg-surface flex items-center justify-center'>
      <div className='flex items-center gap-2.5 text-text-muted text-sm'>
        <Spinner />
        {text}
      </div>
    </div>
  );
}
