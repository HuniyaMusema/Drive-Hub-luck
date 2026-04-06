import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { getNotifications, Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const notifications = await getNotifications();
        const unread = notifications.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    
    // Refresh every 15 seconds for a more "real-time" feel
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <Link to="/notifications" className="relative p-2.5 text-slate-400 hover:text-[#4CBFBF] transition-all bg-slate-50 hover:bg-[#4CBFBF]/5 rounded-xl border border-slate-100 group">
      <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <Badge 
            variant="destructive" 
            className="relative h-5 w-5 flex items-center justify-center p-0 text-[10px] font-black rounded-full border-2 border-white shadow-sm"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
