import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

export default function AdminChatbot() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: 'assistant', content: 'გამარჯობა! მე ვარ Azkard-ის AI ასისტენტი. დამისვი კითხვა ვაკანსიების, კომპანიების ან პლატფორმის შესახებ.' }
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    const newHistory = [...history, { role: 'user', content: msg }];
    setHistory(newHistory);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', {
        message: msg,
        history: newHistory.slice(-10), // last 10 for context
      });
      setHistory(h => [...h, { role: 'assistant', content: data.reply }]);
    } catch {
      setHistory(h => [...h, { role: 'assistant', content: 'შეცდომა მოხდა. სცადე ხელახლა.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3'>

      {/* Chat panel */}
      {open && (
        <div className='w-[340px] bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden'
             style={{ height: '480px' }}>

          {/* Header */}
          <div className='flex items-center gap-2.5 px-4 py-3 border-b border-gray-800 bg-gray-900'>
            <div className='w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2'>
                <path d='M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z'/>
                <path d='M8 12h.01M12 12h.01M16 12h.01' strokeLinecap='round'/>
              </svg>
            </div>
            <div>
              <p className='text-white text-sm font-semibold leading-none'>Azkard AI</p>
              <p className='text-gray-500 text-xs mt-0.5'>Admin assistant</p>
            </div>
            <button onClick={() => setOpen(false)}
                    className='ml-auto text-gray-600 hover:text-gray-300 transition-colors'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin'>
            {history.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap
                  ${m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className='flex justify-start'>
                <div className='bg-gray-800 rounded-xl rounded-bl-sm px-3 py-2.5 flex gap-1 items-center'>
                  <span className='w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
                  <span className='w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
                  <span className='w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className='px-3 py-3 border-t border-gray-800 flex gap-2 items-end'>
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder='დასვი კითხვა...'
              className='flex-1 bg-gray-800 text-white text-sm rounded-xl px-3 py-2.5 resize-none outline-none placeholder-gray-600 focus:ring-1 focus:ring-brand-600 transition-all'
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className='w-9 h-9 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center flex-shrink-0 transition-colors'>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5'>
                <line x1='22' y1='2' x2='11' y2='13'/>
                <polygon points='22 2 15 22 11 13 2 9 22 2'/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className='w-13 h-13 bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/30 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95'
        style={{ width: '52px', height: '52px' }}
        title='Azkard AI Assistant'>
        {open ? (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5'>
            <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
          </svg>
        ) : (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2'>
            <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/>
          </svg>
        )}
      </button>
    </div>
  );
}
