import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

const NotificationToast: React.FC = () => {
  const { notifications } = useChatStore();

  if (notifications.length === 0) return null;

  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {recentNotifications.map((notification, index) => (
        <div 
          key={notification._id || index}
          className="bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-80 max-w-sm animate-in slide-in-from-right-2 flex items-start space-x-3 hover:shadow-2xl transition-shadow"
        >
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {notification.senderId.displayName}
            </p>
            <p className="text-sm text-slate-600 truncate max-w-[200px]">
              {notification.content || notification.fileName || 'Sent a file'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(notification.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          <button className="flex-shrink-0 p-1 hover:bg-slate-100 rounded-full transition-colors opacity-60 hover:opacity-100">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;

