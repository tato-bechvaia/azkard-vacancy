import { useSocket } from '../store/SocketContext';

export default function Toast() {
  const { toast } = useSocket();

  if (!toast) return null;

  return (
    <div className='fixed bottom-6 right-6 z-50 animate-slide-up'>
      <div className='bg-white border border-surface-200 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 max-w-sm'>
        <div className='w-2 h-2 rounded-full bg-brand-600 mt-1.5 flex-shrink-0' />
        <div>
          <p className='text-sm font-medium text-gray-900'>ახალი შეტყობინება</p>
          <p className='text-xs text-gray-500 mt-0.5'>{toast.message}</p>
        </div>
      </div>
    </div>
  );
}