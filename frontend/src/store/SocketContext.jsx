import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_ORIGIN } from '../utils/assetUrl';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [toast, setToast]                   = useState(null);
  const socketRef                           = useRef(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');

    socketRef.current = io(API_ORIGIN, {
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      const payload = JSON.parse(atob(token.split('.')[1]));
      socketRef.current.emit('register', payload.id);
    });

    socketRef.current.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      setToast(notification);
      setTimeout(() => setToast(null), 4000);
    });

    fetchNotifications(token);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  const fetchNotifications = async (token) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/notifications`, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch {}
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_ORIGIN}/api/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token }
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_ORIGIN}/api/notifications/` + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_ORIGIN}/api/notifications`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider value={{
      notifications,
      unreadCount,
      toast,
      markAllRead,
      deleteNotification,
      clearAll,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);