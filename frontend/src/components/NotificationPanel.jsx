import { useState } from 'react';
import { useSocket } from '../store/SocketContext';

export default function NotificationPanel() {
  const { notifications, unreadCount, markAllRead, deleteNotification, clearAll } = useSocket();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (!open && unreadCount > 0) markAllRead();
    setOpen(!open);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)    return 'ახლახანს';
    if (diff < 3600)  return Math.floor(diff / 60) + ' წთ წინ';
    if (diff < 86400) return Math.floor(diff / 3600) + ' სთ წინ';
    return Math.floor(diff / 86400) + ' დღე წინ';
  };

  return (
    <div className='relative'>

      {/* Bell button */}
      <button
        onClick={toggle}
        className={'relative h-8 w-8 flex items-center justify-center rounded-lg transition ' +
          (open
            ? 'bg-brand-50 border border-brand-200'
            : 'hover:bg-surface-100 border border-transparent')}>

        <svg
          width='16' height='16' viewBox='0 0 24 24'
          fill='none' stroke='currentColor' strokeWidth='1.8'
          strokeLinecap='round' strokeLinejoin='round'
          className={open ? 'text-brand-600' : 'text-gray-500'}>
          <path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9'/>
          <path d='M13.73 21a2 2 0 01-3.46 0'/>
        </svg>

        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-1 leading-none'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      {open && (
        <div className='absolute right-0 top-11 w-96 bg-white border border-surface-200 rounded-2xl shadow-xl z-50 overflow-hidden'>

          {/* Header */}
          <div className='flex items-center justify-between px-5 py-3.5 border-b border-surface-100'>
            <div className='flex items-center gap-2'>
              <p className='font-display font-semibold text-sm text-gray-900'>შეტყობინებები</p>
              {unreadCount > 0 && (
                <span className='text-xs bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded-full font-medium'>
                  {unreadCount} ახალი
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className='text-xs text-gray-400 hover:text-red-500 transition'>
                ყველას წაშლა
              </button>
            )}
          </div>

          {/* List */}
          <div className='max-h-80 overflow-y-auto divide-y divide-surface-50'>
            {notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
                <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='mb-3 opacity-30'>
                  <path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9'/>
                  <path d='M13.73 21a2 2 0 01-3.46 0'/>
                </svg>
                <p className='text-sm'>შეტყობინება არ არის</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={'flex items-start gap-3 px-5 py-3.5 hover:bg-surface-50 transition group ' +
                    (!n.isRead ? 'bg-brand-50/40' : '')}>

                  <div className='flex-shrink-0 mt-0.5'>
                    {!n.isRead ? (
                      <div className='w-2 h-2 rounded-full bg-brand-600 mt-1' />
                    ) : (
                      <div className='w-2 h-2 rounded-full bg-gray-200 mt-1' />
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-gray-700 leading-snug'>{n.message}</p>
                    <p className='text-xs text-gray-400 mt-1'>{formatTime(n.createdAt)}</p>
                  </div>

                  <button
                    onClick={() => deleteNotification(n.id)}
                    className='opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition flex-shrink-0'>
                    <svg width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='currentColor' strokeWidth='1.8'>
                      <path d='M1 1l10 10M11 1L1 11'/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className='px-5 py-3 border-t border-surface-100 bg-surface-50'>
              <p className='text-xs text-gray-400 text-center'>
                სულ {notifications.length} შეტყობინება
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}