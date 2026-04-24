const styleVariants = {
  underline: {
    container: 'flex items-center gap-1 border-b border-border-subtle',
    tab:       'px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px whitespace-nowrap',
    active:    'border-brand-500 text-brand-400',
    inactive:  'border-transparent text-text-muted hover:text-text-secondary hover:border-border-strong',
  },
  pill: {
    container: 'flex items-center gap-1 p-1 rounded-xl bg-surface-100',
    tab:       'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap',
    active:    'bg-surface-300 text-text-primary shadow-card',
    inactive:  'text-text-muted hover:text-text-secondary',
  },
};

export default function Tabs({
  tabs,
  activeKey,
  onChange,
  variant = 'pill',
  className = '',
}) {
  const styles = styleVariants[variant];

  return (
    <div className={`${styles.container} ${className}`} role='tablist'>
      {tabs.map(tab => (
        <button
          key={tab.key}
          role='tab'
          aria-selected={activeKey === tab.key}
          onClick={() => onChange(tab.key)}
          className={`${styles.tab} ${activeKey === tab.key ? styles.active : styles.inactive}`}
        >
          {tab.label}
          {tab.count != null && tab.count > 0 && (
            <span className='ml-2 text-[10px] bg-surface-200 text-text-muted px-1.5 py-0.5 rounded-full font-medium'>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
