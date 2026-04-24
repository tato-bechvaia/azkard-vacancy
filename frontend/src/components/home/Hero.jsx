import { Button } from '../ui';

// TODO: pull PARTNER_COUNT from API when a /stats or /meta endpoint is available
const PARTNER_COUNT = 5;

export default function Hero({ search, setSearch, location, setLocation, total }) {
  return (
    <div
      className='border-b border-border-subtle'
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 15% 60%, rgba(107,70,224,0.09) 0%, transparent 60%), #14141B',
      }}
    >
      <div className='max-w-6xl mx-auto px-6 pt-14 pb-12'>

        {/* Eyebrow */}
        <p className='text-brand-400/60 text-xs font-medium tracking-[0.22em] uppercase mb-4'>
          Azkard · Job Board
        </p>

        {/* Headline — exact existing Georgian copy */}
        <h1 className='font-display font-semibold text-4xl text-text-primary leading-[1.12] tracking-tight mb-8'>
          იპოვე სწორი ვაკანსია
        </h1>

        {/* Search bar */}
        <div className='flex items-stretch bg-surface-100 border border-border rounded-2xl overflow-hidden mb-4'>

          {/* Role / keyword input */}
          <div className='flex items-center gap-3 flex-1 px-5'>
            <svg
              width='14' height='14' viewBox='0 0 24 24' fill='none'
              stroke='currentColor' strokeWidth='1.75'
              className='flex-shrink-0 text-text-muted'
            >
              <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
            </svg>
            <input
              type='text'
              placeholder='ვაკანსია, კომპანია ან საკვანძო სიტყვა'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='flex-1 h-[3.125rem] text-sm text-text-primary placeholder-text-muted focus:outline-none bg-transparent'
            />
          </div>

          {/* Divider */}
          <div className='w-px bg-border-subtle my-3' />

          {/* City input */}
          <div className='flex items-center gap-3 w-44 px-5'>
            <svg
              width='12' height='12' viewBox='0 0 24 24' fill='none'
              stroke='currentColor' strokeWidth='1.75'
              className='flex-shrink-0 text-text-muted'
            >
              <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/>
              <circle cx='12' cy='10' r='3'/>
            </svg>
            <input
              type='text'
              placeholder='ქალაქი'
              value={location}
              onChange={e => setLocation(e.target.value)}
              className='flex-1 h-[3.125rem] text-sm text-text-primary placeholder-text-muted focus:outline-none bg-transparent'
            />
          </div>

          {/* Search button */}
          <div className='p-2'>
            <Button size='md' className='h-[2.625rem] px-6 rounded-xl'>
              ძიება
            </Button>
          </div>
        </div>

        {/* Trust signal */}
        {total > 0 && (
          <p className='text-xs text-text-muted'>
            <span className='text-text-secondary font-medium'>{total.toLocaleString()}</span>
            {' '}აქტიური ვაკანსია
            {' · '}
            <span className='text-text-secondary font-medium'>{PARTNER_COUNT}</span>
            {' '}პარტნიორი კომპანია
          </p>
        )}
      </div>
    </div>
  );
}
