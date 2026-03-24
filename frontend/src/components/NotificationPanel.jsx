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
    if (diff < 60)   return 'ახლახანს';
    if (diff < 3600) return Math.floor(diff / 60) + ' წუთის წინ';
    if (diff < 86400) return Math.floor(diff / 3600) + ' საათის წინ';
    return Math.floor(diff / 86400) + ' დღის წინ';
  };

  return (
    <div className='relative'>
      <button
        onClick={toggle}
        className='relative h-8 w-8 flex items-center justify-center rounded-lg border border-surface-200 bg-surface-50 hover:bg-surface-100 transition'>
        <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-gray-500'>
          <path d='M8 1a5 5 0 00-5 5v2.5L1.5 10v.5h13V10L13 8.5V6a5 5 0 00-5-5z'/>
          <path d='M6.5 13a1.5 1.5 0 003 0'/>
        </svg>
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => setOpen(false)}
          />
          <div className='absolute right-0 top-10 w-80 bg-white border border-surface-200 rounded-2xl shadow-lg z-50 overflow-hidden'>
            <div className='flex items-center justify-between px-4 py-3 border-b border-surface-100'>
              <p className='font-display font-semibold text-sm text-gray-900'>
                შეტყობინებები
                {unreadCount > 0 && (
                  <span className='ml-2 text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full'>
                    {unreadCount} ახალი
                  </span>
                )}
              </p>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className='text-xs text-red-400 hover:text-red-600 transition'>
                  ყველას წაშლა
                </button>
              )}
            </div>

            <div className='max-h-96 overflow-y-auto'>
              {notifications.length === 0 ? (
                <div className='px-4 py-8 text-center text-gray-400 text-sm'>
                  შეტყობინება არ არის
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={'flex items-start gap-3 px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition ' +
                      (!n.isRead ? 'bg-brand-50/30' : '')}>
                    <div className={'w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ' +
                      (!n.isRead ? 'bg-brand-600' : 'bg-transparent')}>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm text-gray-700 leading-snug'>{n.message}</p>
                      <p className='text-xs text-gray-400 mt-0.5'>{formatTime(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className='text-gray-300 hover:text-red-400 transition flex-shrink-0 text-lg leading-none'>
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}